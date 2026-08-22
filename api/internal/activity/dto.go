package activity

type UpsertRequest struct {
	Title       string  `json:"title" validate:"required"`
	Description string  `json:"description"`
	Emoji       string  `json:"emoji"`
	Badge       string  `json:"badge"`
	PhotoURL    *string `json:"photo_url"`
}
