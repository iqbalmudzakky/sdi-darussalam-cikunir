package logger

import (
	"log/slog"
	"os"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
)

func New(cfg config.Config) *slog.Logger {
	level := slog.LevelDebug
	if cfg.Env == "production" {
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{Level: level}

	var handler slog.Handler
	if cfg.Env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}
