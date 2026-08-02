package activity

type Repository interface {
	List() ([]Activity, error)
}
