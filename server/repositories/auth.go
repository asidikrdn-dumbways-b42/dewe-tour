package repositories

import (
	"dewetour/models"
)

// membuat interface untuk menampung beberapa method dari struct repository, agar bisa langsung dipanggil tanpa memanggil struct/objectnya
type AuthRepository interface {
	Register(newUser models.User) (models.User, error)
	Login(email string) (models.User, error)
	IsUserRegistered(email string) bool
}

// menambahkan method pada struct repository untuk register user ke database
func (r *repository) Register(newUser models.User) (models.User, error) {
	errAddUser := r.db.Create(&newUser).Error
	return newUser, errAddUser
}

// memeriksa apakah user sudah terdaftar
func (r *repository) IsUserRegistered(email string) bool {
	// validasi data user, jika email sudah terdaftar maka kirimkan pesan error bahwa user sudah terdaftar
	var user models.User
	errCekUser := r.db.First(&user, "email=?", email).Error
	return errCekUser == nil
}

// menambahkan method pada struct repository untuk mengambil salah satu data user dari database
func (r *repository) Login(email string) (models.User, error) {
	var user models.User

	// mengambil data user menggunakan method First() milik object db yang berada pada struct repository, lalu disimpan di variabel user
	err := r.db.First(&user, "email=?", email).Error
	return user, err
}
