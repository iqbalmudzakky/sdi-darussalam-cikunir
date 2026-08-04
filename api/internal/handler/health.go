package handler

import (
	"context"
	"encoding/json"
	"net/http"
)

type pinger interface {
	Ping(ctx context.Context) error
}

type HealthHandler struct {
	pool pinger
}

func NewHealthHandler(pool pinger) *HealthHandler {
	return &HealthHandler{pool: pool}
}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	status := "ok"
	code := http.StatusOK

	if err := h.pool.Ping(r.Context()); err != nil {
		status = "database unreachable"
		code = http.StatusServiceUnavailable
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}
