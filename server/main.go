package main

import (
	"dewetour/database"
	"dewetour/pkg/mysql"
	"dewetour/routes"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// import .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	// initial DB
	mysql.DatabaseInit()

	// run migration
	database.RunMigration()
	database.RunSeeder()

	// membuat router baru
	r := mux.NewRouter()

	// membuat routing file server (berguna untuk mengakses file-file static yang dibutuhkan, misalnya file css, gambar, js, dll)
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", // semua request yang masuk ke endpoint `/static` akan diarahkan ke actual handler
		http.FileServer(http.Dir("./uploads")))) // actual handler

	// Memanggil RouterInit dari package routes dengan parameter router yang sudah di-path prefix , path prefix digunakan untuk membungkus endpoint '/xxx' menjadi '/api/v1/xxx'
	routes.RouterInit(r.PathPrefix("/api/v1").Subrouter())

	// setup request header yang diizinkan
	AllowedHeaders := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	// setup origin yang diizinkan
	// AllowedOrigins := handlers.AllowedHeaders([]string{os.Getenv("ORIGIN_ALLOWED")})
	AllowedOrigins := handlers.AllowedOrigins([]string{"*"})
	// setup method yang diizinkan
	AllowedMethods := handlers.AllowedMethods([]string{"HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"})

	// menjalankan web server
	fmt.Println("server running localhost:" + os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), handlers.CORS(AllowedHeaders, AllowedOrigins, AllowedMethods)(r))
}
