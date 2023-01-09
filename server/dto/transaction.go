package dto

import "dewetour/models"

type TransactionRequest struct {
	CounterQty int    `json:"counterQty" validate:"required" form:"counterQty"`
	Total      int    `json:"total" validate:"required" form:"total"`
	Status     string `json:"status" form:"status"`
	TripID     int    `json:"tripId" validate:"required" form:"tripId"`
}

type UpdateTransactionRequest struct {
	Status string `json:"status" form:"status"`
}

type TransactionResponse struct {
	ID          string              `json:"id"`
	CounterQty  int                 `json:"counterQty"`
	Total       int                 `json:"total"`
	Status      string              `json:"status"`
	BookingDate string              `json:"bookingDate"`
	Token       string              `json:"token"`
	Trip        TripResponse        `json:"trip"`
	User        models.UserResponse `json:"user"`
}
