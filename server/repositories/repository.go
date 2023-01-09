package repositories

import "gorm.io/gorm"

// membuat struct repository yang berisikan koneksi database dan nantinya ditambahkan beberapa method untuk berkomunikasi dengan database
type repository struct {
	db *gorm.DB
}

// membuat function yang mengembalikan object bertipe repository lengkap dengan seluruh methodnya, method ini membutuhhkan koneksi database sebagai parameternya yang akan disimpan di object bertipe repository
func MakeRepository(db *gorm.DB) *repository {
	return &repository{db}
}
