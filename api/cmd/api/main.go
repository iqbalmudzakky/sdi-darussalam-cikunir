package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/logger"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/router"
)

func main() {
	cfg := config.Load()

	log := logger.New(cfg)
	slog.SetDefault(log)

	r := router.New(cfg, log)

	log.Info("server starting", "port", cfg.Port, "env", cfg.Env)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Error("server failed", "error", err)
		os.Exit(1)
	}
}
