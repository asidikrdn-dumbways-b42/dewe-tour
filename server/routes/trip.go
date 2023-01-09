package routes

import (
	"dewetour/handlers"
	"dewetour/pkg/middleware"
	"dewetour/pkg/postgre"
	"dewetour/repositories"

	"github.com/gorilla/mux"
)

func Trip(r *mux.Router) {
	tripRepository := repositories.MakeRepository(postgre.DB)
	h := handlers.HandlerTrip(tripRepository)

	// menghandle request dengan method GET pada endpoint /trip
	r.HandleFunc("/trip", h.GetAllTrip).Methods("GET")

	// menghandle request dengan method GET pada endpoint /trip/{id_trip}
	r.HandleFunc("/trip/{id_trip}", h.GetDetailTrip).Methods("GET")

	// menghandle request dengan method POST pada endpoint /trip
	r.HandleFunc("/trip", middleware.AdminAuth(middleware.UploadTripImage(h.AddTrip))).Methods("POST")

	// menghandle request dengan method PATCH pada endpoint /trip/{id_trip}
	r.HandleFunc("/trip/{id_trip}", middleware.AdminAuth(middleware.UploadTripImage(h.UpdateTrip))).Methods("PATCH")

	// menghandle request dengan method DELETE pada endpoint /trip/{id_trip}
	r.HandleFunc("/trip/{id_trip}", middleware.AdminAuth(h.DeleteTrip)).Methods("DELETE")
}
