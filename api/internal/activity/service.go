package activity

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context) ([]Activity, error) {
	list, err := s.repo.List(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "Repository Error: List failed", "error", err)
		return nil, err
	}
	return list, nil
}

func (s *Service) Create(ctx context.Context, req UpsertRequest) (*Activity, error) {
	a := &Activity{
		Title:       req.Title,
		Description: req.Description,
		Emoji:       req.Emoji,
		Badge:       req.Badge,
		PhotoURL:    req.PhotoURL,
	}
	if err := s.repo.Create(ctx, a); err != nil {
		slog.ErrorContext(ctx, "Repository Error: Create failed", "error", err)
		return nil, err
	}
	return a, nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req UpsertRequest) (*Activity, error) {
	a, err := s.repo.Update(ctx, id, req)
	if err != nil {
		slog.ErrorContext(ctx, "Repository Error: Update failed", "id", id, "error", err)
		return nil, err
	}
	return a, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		slog.ErrorContext(ctx, "Repository Error: Delete failed", "id", id, "error", err)
		return err
	}
	return nil
}
