package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Env                string
	CORSAllowedOrigins []string
	RateLimitPerMinute int
	DatabaseURL        string
	SupabaseJWKSURL    string
}

func Load() Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	origins := parseOrigins(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if len(origins) == 0 {
		origins = []string{"http://localhost:3000"}
	}

	rateLimit, err := strconv.Atoi(os.Getenv("RATE_LIMIT_PER_MINUTE"))
	if err != nil || rateLimit <= 0 {
		rateLimit = 100
	}

	return Config{
		Port:               port,
		Env:                env,
		CORSAllowedOrigins: origins,
		RateLimitPerMinute: rateLimit,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		SupabaseJWKSURL:    os.Getenv("SUPABASE_JWKS_URL"),
	}
}

func parseOrigins(raw string) []string {
	if raw == "" {
		return nil
	}

	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	return origins
}
