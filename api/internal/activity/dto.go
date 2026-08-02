package activity

type CreateRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	Emoji       string `json:"emoji"`
	Badge       string `json:"badge"`
}

type UpdateRequest struct {
	Title       string  `json:"title" validate:"required"`
	Description string  `json:"description"`
	Emoji       string  `json:"emoji"`
	Badge       string  `json:"badge"`
	PhotoURL    *string `json:"photo_url"`
}

type Response struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Emoji       string  `json:"emoji"`
	Badge       string  `json:"badge"`
	PhotoURL    *string `json:"photo_url"`
}
