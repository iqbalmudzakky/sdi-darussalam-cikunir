package logger

import (
	"log/slog"
	"os"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/common"
	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/config"
)

func New(cfg config.Config) *slog.Logger {
	level := slog.LevelDebug
	if cfg.Env == "production" {
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{Level: level}

	var handler slog.Handler
	if cfg.Env == "development" {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	return slog.New(common.NewContextHandler(handler))
}
