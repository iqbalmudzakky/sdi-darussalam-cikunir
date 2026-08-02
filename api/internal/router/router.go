package router

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/handler"
)

func New(cfg config.Config, log *slog.Logger) http.Handler {
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
		AllowCredentials: true,
	}))

	r.Get("/health", handler.Health)

	return r
}

func requestLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			next.ServeHTTP(ww, r)

			log.Info("http_request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"duration_ms", time.Since(start).Milliseconds(),
				"client_ip", resolveClientIP(r),
			)
		})
	}
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
