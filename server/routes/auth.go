package routes

import (
	"dewetour/handlers"
	"dewetour/pkg/middleware"
	"dewetour/pkg/mysql"
	"dewetour/repositories"

	"github.com/gorilla/mux"
)

func Auth(r *mux.Router) {
	authRepository := repositories.MakeRepository(mysql.DB)
	h := handlers.HandlerAuth(authRepository)

	// menghandle request dengan method POST pada endpoint /register
	r.HandleFunc("/register", h.Register).Methods("POST")
	r.HandleFunc("/verification/{token}", h.VerifyRegistration).Methods("GET")

	// menghandle request dengan method POST pada endpoint /register
	r.HandleFunc("/register-admin", h.RegisterAdmin).Methods("POST")

	// menghandle request dengan method POST pada endpoint /login
	r.HandleFunc("/login", h.Login).Methods("POST")

	// endpoint untuk pengecekan status login
	r.HandleFunc("/check-auth", middleware.UserAuth(h.CheckAuth)).Methods("GET")
}
