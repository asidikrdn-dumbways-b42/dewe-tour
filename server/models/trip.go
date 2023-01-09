package models

import "time"

// membuat struct Trip untuk digunakan sebagai template tipe data yang akan disinkronkan dengan tabel pada database
type Trip struct {
	ID             int                   `json:"id"`
	Title          string                `json:"title" gorm:"type: varchar(255)"`
	CountryID      int                   `json:"id_country" form:"id_country"`
	Country        CountryResponse       `json:"country"`
	Accomodation   string                `json:"accomodation" gorm:"type: varchar(255)"`
	Transportation string                `json:"transportation" gorm:"type: varchar(255)"`
	Eat            string                `json:"eat" gorm:"type: varchar(255)"`
	Day            int                   `json:"day" gorm:"type: int"`
	Night          int                   `json:"night" gorm:"type: int"`
	DateTrip       time.Time             `json:"dateTrip"`
	Price          int                   `json:"price" gorm:"type: int"`
	TotalQuota     int                   `json:"totalQuota" gorm:"type: int"`
	QuotaAvailable int                   `json:"quotaAvailable" gorm:"type: int"`
	Description    string                `json:"description"`
	Image          []ImageResponse       `json:"images" gorm:"foreignKey:TripID"`
	Transaction    []TransactionResponse `json:"transactions" gorm:"foreignKey:TripID"`
}

type TripResponse struct {
	ID             int             `json:"id"`
	Title          string          `json:"title"`
	CountryID      int             `json:"-"`
	Country        CountryResponse `json:"country"`
	Accomodation   string          `json:"accomodation"`
	Transportation string          `json:"transportation"`
	Eat            string          `json:"eat"`
	Day            int             `json:"day"`
	Night          int             `json:"night"`
	DateTrip       time.Time       `json:"dateTrip"`
	Price          int             `json:"price"`
	TotalQuota     int             `json:"totalQuota"`
	QuotaAvailable int             `json:"quotaAvailable"`
	Description    string          `json:"description"`
	Image          []ImageResponse `json:"images" gorm:"foreignKey:TripID"`
}

func (TripResponse) TableName() string {
	return "trips"
}
