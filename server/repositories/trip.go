package repositories

import (
	"dewetour/models"

	"gorm.io/gorm"
)

// membuat interface untuk menampung beberapa method dari struct repository, agar bisa langsung dipanggil tanpa memanggil struct/objectnya
type TripRepository interface {
	FindTrips() ([]models.Trip, error)
	GetTrip(ID int) (models.Trip, error)
	CreateTrip(newTrip models.Trip) (models.Trip, error)
	UpdateTrip(trip models.Trip) (models.Trip, error)
	DeleteTrip(trip models.Trip) (models.Trip, error)
}

func (r *repository) FindTrips() ([]models.Trip, error) {
	var trips []models.Trip
	err := r.db.Preload("Country").Preload("Image").Find(&trips).Error
	return trips, err
}

func (r *repository) GetTrip(ID int) (models.Trip, error) {
	var trip models.Trip
	err := r.db.Preload("Country").Preload("Image").First(&trip, ID).Error
	return trip, err
}

func (r *repository) CreateTrip(newTrip models.Trip) (models.Trip, error) {
	err := r.db.Create(&newTrip).Preload("Country").Error
	return newTrip, err
}

func (r *repository) UpdateTrip(trip models.Trip) (models.Trip, error) {
	// err := r.db.Save(&trip).Error // jika bertemu duplikat key, tidak akan mengupdate

	// db.Session digunakan agar jika bertemu duplikat key, value dari key tersebut akan diupdate sesuai dengan yang terbaru
	// Model dan Updates digunakan karena tabel Trip memiliki relasi belongsto dengan country
	err := r.db.Session(&gorm.Session{FullSaveAssociations: true}).Model(&trip).Updates(trip).Error

	// menghapus gambar yang tidak lagi terpakai
	r.db.Exec("DELETE from images where file_name = ?", "unused")

	return trip, err
}

func (r *repository) DeleteTrip(trip models.Trip) (models.Trip, error) {
	err := r.db.Select("Image").Delete(&trip).Error
	return trip, err
}
