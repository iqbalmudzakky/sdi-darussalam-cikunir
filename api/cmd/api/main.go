package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/authn"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/db"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/logger"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/router"
)

func main() {
	cfg := config.Load()

	log := logger.New(cfg)
	slog.SetDefault(log)

	ctx := context.Background()

	pool, err := db.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	verifier, err := authn.NewVerifier(ctx, cfg.SupabaseJWKSURL)
	if err != nil {
		log.Error("failed to set up JWT verifier", "error", err)
		os.Exit(1)
	}

	r := router.New(cfg, log, pool, verifier)

	log.Info("server starting", "port", cfg.Port, "env", cfg.Env)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Error("server failed", "error", err)
		os.Exit(1)
	}
}
