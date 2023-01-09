package routes

import (
	"dewetour/handlers"
	"dewetour/pkg/middleware"
	"dewetour/pkg/postgre"
	"dewetour/repositories"

	"github.com/gorilla/mux"
)

func Country(r *mux.Router) {
	// membuat object dari struct repository yang berisikan koneksi database dan beberapa method untuk komunikasi dengan databaase
	countryRepository := repositories.MakeRepository(postgre.DB)

	// membuat object dari struct handlerCountry yang berisikan method-method milik struct handleCountry, dan interface CountryRepository yang didalamnya terdapat beberapa method milik struct repository.
	h := handlers.HandlerCountry(countryRepository)

	// menghandle request dengan method GET pada endpoint /country
	r.HandleFunc("/country", h.GetAllCountry).Methods("GET")

	// menghandle request dengan method GET pada endpoint /country/{id_country}
	r.HandleFunc("/country/{id_country}", h.GetDetailCountry).Methods("GET")

	// menghandle request dengan method POST pada endpoint /country
	r.HandleFunc("/country", middleware.AdminAuth(h.AddCountry)).Methods("POST")

	// menghandle request dengan method PATCH pada endpoint /country/{id_country}
	r.HandleFunc("/country/{id_country}", middleware.AdminAuth(h.UpdateCountry)).Methods("PATCH")

	// menghandle request dengan method DELETE pada endpoint /country
	r.HandleFunc("/country/{id_country}", middleware.AdminAuth(h.DeleteCountry)).Methods("DELETE")

}
