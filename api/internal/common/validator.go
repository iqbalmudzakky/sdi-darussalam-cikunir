package common

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

func ValidateStruct(s any) error {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	if _, ok := err.(*validator.InvalidValidationError); ok {
		return err
	}

	var errMsgs []string
	for _, fieldErr := range err.(validator.ValidationErrors) {
		errMsgs = append(errMsgs, fmt.Sprintf("field %s: %s %s", fieldErr.Field(), fieldErr.Tag(), fieldErr.Param()))
	}

	return fmt.Errorf("validation failed: %s", strings.Join(errMsgs, ", "))
}
