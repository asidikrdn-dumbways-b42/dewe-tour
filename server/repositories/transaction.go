package repositories

import (
	"dewetour/models"
)

// membuat interface untuk menampung beberapa method dari struct repository, agar bisa langsung dipanggil tanpa memanggil struct/objectnya
type TransactionRepository interface {
	CreateTransaction(newTransaction models.Transaction) (models.Transaction, error)
	FindTransactions() ([]models.Transaction, error)
	GetTransaction(ID string) (models.Transaction, error)
	UpdateTransaction(status string, trxId string) (models.Transaction, error)
	FindTransactionsByUser(UserId int) ([]models.Transaction, error)
	UpdateTokenTransaction(token string, trxId string) (models.Transaction, error)
}

func (r *repository) FindTransactions() ([]models.Transaction, error) {
	var transaction []models.Transaction
	err := r.db.Preload("Trip.Country").Preload("Trip.Image").Preload("Trip").Preload("User").Order("booking_date desc").Find(&transaction).Error

	return transaction, err
}

func (r *repository) FindTransactionsByUser(UserId int) ([]models.Transaction, error) {
	var transaction []models.Transaction
	err := r.db.Preload("Trip.Country").Preload("Trip.Image").Preload("Trip").Preload("User").Where("user_id = ?", UserId).Order("booking_date desc").Find(&transaction).Error

	return transaction, err
}

func (r *repository) GetTransaction(ID string) (models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.Preload("Trip.Country").Preload("Trip.Image").Preload("Trip").Preload("User").First(&transaction, "id = ?", ID).Error

	return transaction, err
}

func (r *repository) CreateTransaction(newTransaction models.Transaction) (models.Transaction, error) {
	err := r.db.Create(&newTransaction).Error

	return newTransaction, err
}

func (r *repository) UpdateTransaction(status string, trxId string) (models.Transaction, error) {
	var transaction models.Transaction
	r.db.Preload("Trip.Country").Preload("Trip.Image").Preload("Trip").Preload("User").First(&transaction, "id = ?", trxId)

	// If is different & Status is "success" decrement available quota on data trip
	if status != transaction.Status && status == "success" {
		var trip models.Trip
		r.db.First(&trip, transaction.TripID)
		trip.QuotaAvailable = trip.QuotaAvailable - transaction.CounterQty
		r.db.Model(&trip).Updates(trip)
	}

	// If is different & Status is "reject" decrement available quota on data trip
	if status != transaction.Status && status == "reject" {
		var trip models.Trip
		r.db.First(&trip, transaction.TripID)
		trip.QuotaAvailable = trip.QuotaAvailable + transaction.CounterQty
		r.db.Model(&trip).Updates(trip)
	}

	// change transaction status
	transaction.Status = status

	// fmt.Println(status)
	// fmt.Println(transaction.Status)
	// fmt.Println(transaction.ID)

	err := r.db.Model(&transaction).Updates(transaction).Error

	return transaction, err
}

func (r *repository) UpdateTokenTransaction(token string, trxId string) (models.Transaction, error) {
	var transaction models.Transaction
	r.db.Preload("Trip.Country").Preload("Trip.Image").Preload("Trip").Preload("User").First(&transaction, "id = ?", trxId)

	// change transaction token
	transaction.Token = token

	err := r.db.Model(&transaction).Updates(transaction).Error

	return transaction, err
}

func (r *repository) DeleteTransaction(transaction models.Transaction) (models.Transaction, error) {
	err := r.db.Delete(&transaction).Error

	return transaction, err
}
