package handler

import (
	"encoding/json"
	"net/http"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/authn"
)

func Me(w http.ResponseWriter, r *http.Request) {
	user, ok := authn.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "no authenticated user in context", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
