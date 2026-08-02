package activity

import "time"

type Activity struct {
	ID          string
	Title       string
	Description string
	Emoji       string
	Badge       string
	PhotoURL    *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
