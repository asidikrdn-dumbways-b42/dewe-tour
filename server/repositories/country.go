package repositories

import (
	"dewetour/models"
)

// membuat interface untuk menampung method-method dari struct repository, agar bisa langsung dipanggil tanpa memanggil struct/objectnya
type CountryRepository interface {
	FindCountry() ([]models.Country, error)
	GetCountry(ID int) (models.Country, error)
	CreateCountry(newCountry models.Country) (models.Country, error)
	DeleteCountry(country models.Country) (models.Country, error)
	UpdateCountry(country models.Country) (models.Country, error)
}

// menambahkan method pada struct repository untuk mengambil data semua country dari database
func (r *repository) FindCountry() ([]models.Country, error) {
	var country []models.Country

	// mengambil data country menggunakan method Find() milik object db yang berada pada struct repository, lalu disimpan di variabel country
	err := r.db.Find(&country).Error
	return country, err
}

// menambahkan method pada struct repository untuk mengambil salah satu data country dari database
func (r *repository) GetCountry(ID int) (models.Country, error) {
	var country models.Country

	// mengambil data country menggunakan method First() milik object db yang berada pada struct repository, lalu disimpan di variabel country
	err := r.db.First(&country, ID).Error
	return country, err
}

// menambahkan method pada struct repository untuk menambahkan data country baru ke database
func (r *repository) CreateCountry(newCountry models.Country) (models.Country, error) {
	err := r.db.Create(&newCountry).Error
	return newCountry, err
}

// menambahkan method pada struct repository untuk menghapus satu data country dari database
func (r *repository) DeleteCountry(country models.Country) (models.Country, error) {
	err := r.db.Delete(&country).Error
	return country, err
}

// menambahkan method pada struct repository untuk mengupdate satu data country di database
func (r *repository) UpdateCountry(country models.Country) (models.Country, error) {
	err := r.db.Save(&country).Error
	return country, err
}
