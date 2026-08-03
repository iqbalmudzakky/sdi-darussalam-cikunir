package router

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/activity"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/authn"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/common"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/handler"
)

func New(
	cfg config.Config,
	log *slog.Logger,
	pool *pgxpool.Pool,
	verifier *authn.Verifier,
	activityHandler *activity.Handler,
) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	r.Use(middleware.ClientIPFromXFFTrustedProxies(1))
	r.Use(requestLogger(log))
	r.Use(middleware.Timeout(15 * time.Second))
	r.Use(httprate.LimitBy(cfg.RateLimitPerMinute, time.Minute, rateLimitKey))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
	}))

	r.Get("/health", handler.NewHealthHandler(pool).ServeHTTP)

	r.Group(func(r chi.Router) {
		r.Use(verifier.Middleware)
		r.Get("/me", handler.Me)

		r.Route("/activities", func(r chi.Router) {
			r.Get("/", activityHandler.List)
			r.Post("/", activityHandler.Create)
			r.Put("/{id}", activityHandler.Update)
			r.Delete("/{id}", activityHandler.Delete)
		})
	})

	return r
}

func requestLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			traceID := traceIDFromRequest(r)
			w.Header().Set("X-Request-ID", traceID)
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			ctx := common.WithTraceID(r.Context(), traceID)
			r = r.WithContext(ctx)

			next.ServeHTTP(ww, r)

			log.InfoContext(ctx, "http_request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"duration_ms", time.Since(start).Milliseconds(),
				"client_ip", resolveClientIP(r),
			)
		})
	}
}

func traceIDFromRequest(r *http.Request) string {
	if id := r.Header.Get("X-Request-ID"); id != "" {
		return id
	}
	if id := r.Header.Get("X-Trace-ID"); id != "" {
		return id
	}
	return uuid.New().String()
}

func resolveClientIP(r *http.Request) string {
	if ip := middleware.GetClientIP(r.Context()); ip != "" {
		return ip
	}
	return r.RemoteAddr
}

func rateLimitKey(r *http.Request) (string, error) {
	return httprate.CanonicalizeIP(resolveClientIP(r)), nil
}
