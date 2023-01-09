package dto

type RegisterRequest struct {
	FullName string `json:"fullName" validate:"required"`
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
	Phone    string `json:"phone" validate:"required"`
	Gender   string `json:"gender" validate:"required"`
	Address  string `json:"address" validate:"required"`
}

type RegisterResponse struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Gender   string `json:"gender"`
	Role     string `json:"role"`
	Address  string `json:"address"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// type LoginResponse struct {
// 	Email string `json:"email"`
// 	Role  string `json:"role"`
// 	Token string `json:"token"`
// }

type AuthResponse struct {
	// UserID int    `json:"userId"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token"`
}
