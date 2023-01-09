package mysql

import (
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// membuat fungsi untuk koneksi database
func DatabaseInit() {
	var err error

	// database url
	dsn := os.Getenv("DATABASE_URL")

	// membuka koneksi ke database
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("Connected to Database")
}
