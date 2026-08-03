package activity

import (
	"time"

	"github.com/google/uuid"
)

type Activity struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Emoji       string    `json:"emoji"`
	Badge       string    `json:"badge"`
	PhotoURL    *string   `json:"photo_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
