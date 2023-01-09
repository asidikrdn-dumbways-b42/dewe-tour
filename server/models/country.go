package models

// membuat struct Country untuk digunakan sebagai template tipe data yang akan disinkronkan dengan tabel pada database
type Country struct {
	ID   int            `json:"id"`
	Name string         `json:"name" gorm:"type: varchar(255)"`
	Trip []TripResponse `json:"trip" gorm:"foreignKey:CountryID"`
}

// tipe data yang diexport untuk tabel yang berelasi
type CountryResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// membuat relasi
func (CountryResponse) TableName() string {
	return "countries"
}
