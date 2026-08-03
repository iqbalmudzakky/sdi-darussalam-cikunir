package activity

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/iqbalmudzakky/sdi-darussalam-cikunir/api/internal/db"
)

type Repository interface {
	List(ctx context.Context) ([]Activity, error)
	Create(ctx context.Context, a *Activity) error
	Update(ctx context.Context, id uuid.UUID, req UpsertRequest) (*Activity, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type repository struct {
	db db.Pool
}

func NewRepository(pool db.Pool) Repository {
	return &repository{db: pool}
}

func (r *repository) List(ctx context.Context) ([]Activity, error) {
	query := `
		SELECT id, title, description, emoji, badge, photo_url, created_at, updated_at
		FROM activities
		ORDER BY created_at
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("repository: List query failed: %w", err)
	}
	defer rows.Close()

	var list []Activity
	for rows.Next() {
		var a Activity
		if err := rows.Scan(
			&a.ID, &a.Title, &a.Description, &a.Emoji, &a.Badge, &a.PhotoURL,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("repository: List scan failed: %w", err)
		}
		list = append(list, a)
	}
	return list, nil
}

func (r *repository) Create(ctx context.Context, a *Activity) error {
	query := `
		INSERT INTO activities (title, description, emoji, badge, photo_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, a.Title, a.Description, a.Emoji, a.Badge, a.PhotoURL).
		Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return fmt.Errorf("repository: Create failed: %w", err)
	}
	return nil
}

func (r *repository) Update(ctx context.Context, id uuid.UUID, req UpsertRequest) (*Activity, error) {
	query := `
		UPDATE activities
		SET title = $1, description = $2, emoji = $3, badge = $4, photo_url = $5, updated_at = now()
		WHERE id = $6
		RETURNING id, title, description, emoji, badge, photo_url, created_at, updated_at
	`
	var a Activity
	err := r.db.QueryRow(ctx, query, req.Title, req.Description, req.Emoji, req.Badge, req.PhotoURL, id).
		Scan(&a.ID, &a.Title, &a.Description, &a.Emoji, &a.Badge, &a.PhotoURL, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, err
		}
		return nil, fmt.Errorf("repository: Update failed: %w", err)
	}
	return &a, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := r.db.Exec(ctx, "DELETE FROM activities WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("repository: Delete failed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
