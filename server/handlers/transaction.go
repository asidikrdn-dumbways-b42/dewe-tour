package handlers

import (
	"dewetour/dto"
	"dewetour/models"
	"dewetour/repositories"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
	_ "time/tzdata"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"github.com/leekchan/accounting"
	"gopkg.in/gomail.v2"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
)

type handlerTransaction struct {
	TransactionRepository repositories.TransactionRepository
}

func HandlerTransaction(TransactionRepository repositories.TransactionRepository) *handlerTransaction {
	return &handlerTransaction{TransactionRepository}
}

// deklarasi Core API midtrans
var c = coreapi.Client{
	ServerKey: os.Getenv("SERVER_KEY"),
	ClientKey: os.Getenv("CLIENT_Key"),
}

func (h *handlerTransaction) AddTransaction(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if err := r.ParseForm(); err != nil {
		panic(err.Error())
	}

	// mengambil data dari request form
	var request dto.TransactionRequest
	json.NewDecoder(r.Body).Decode(&request)

	// memvalidasi inputan dari request body berdasarkan struct dto.TransactionRequest
	validation := validator.New()
	err := validation.Struct(request)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengambil id user dari context yang dikirim oleh middleware
	claims := r.Context().Value("userInfo").(jwt.MapClaims)
	var UserId = int(claims["id"].(float64))

	// membuat id unik, dan melakukan pengecekan dengan looping
	var TrxIdIsMatch = false
	var TrxID string
	for !TrxIdIsMatch {
		TrxID = fmt.Sprintf("TRX-%d-%d-%d", UserId, request.TripID, int(time.Now().UnixNano()))
		transactionData, _ := h.TransactionRepository.GetTransaction(TrxID)
		if transactionData.ID == "" {
			TrxIdIsMatch = true
		}
	}

	// membuat object Transaction baru dengan cetakan models.Transaction
	newTransaction := models.Transaction{
		ID:          TrxID,
		CounterQty:  request.CounterQty,
		Total:       request.Total,
		Status:      request.Status,
		TripID:      request.TripID,
		UserID:      UserId,
		BookingDate: timeIn("Asia/Jakarta"),
	}

	// mengirim data Transaction baru ke database
	transactionAdded, err := h.TransactionRepository.CreateTransaction(newTransaction)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{Code: http.StatusInternalServerError, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengambil data transaction yang baru ditambahkan
	gettransactionAdded, _ := h.TransactionRepository.GetTransaction(transactionAdded.ID)

	var s = snap.Client{}
	s.New(os.Getenv("SERVER_KEY"), midtrans.Sandbox)

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  gettransactionAdded.ID,
			GrossAmt: int64(gettransactionAdded.Total),
		},
		CreditCard: &snap.CreditCardDetails{
			Secure: true,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: gettransactionAdded.User.FullName,
			Email: gettransactionAdded.User.Email,
		},
	}

	snapResp, _ := s.CreateTransaction(req)

	// mengupdate token di database
	transaction, _ := h.TransactionRepository.UpdateTokenTransaction(snapResp.Token, gettransactionAdded.ID)

	// mengambil data transaction yang baru diupdate
	transactionUpdated, _ := h.TransactionRepository.GetTransaction(transaction.ID)

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertOneTransactionResponse(transactionUpdated),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerTransaction) Notification(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Notification received")

	var notificationPayload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&notificationPayload)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	transactionStatus := notificationPayload["transaction_status"].(string)
	fraudStatus := notificationPayload["fraud_status"].(string)
	orderId := notificationPayload["order_id"].(string)

	transaction, err := h.TransactionRepository.GetTransaction(orderId)
	// jika transaksi di database tidak ditemukan, atau sudah dihapus, maka hentikan fungsi notification (menghindari app crash)
	if err != nil {
		fmt.Println("Transaction not found")
		return
	}
	// fmt.Println("transaction status :", transactionStatus)
	// fmt.Println("fraud status :", fraudStatus)
	// fmt.Println("order id :", orderId)
	// fmt.Println(transactionStatus, fraudStatus, orderId, transaction)

	if transactionStatus == "capture" {
		if fraudStatus == "challenge" {
			// TODO set transaction status on your database to 'challenge'
			// e.g: 'Payment status challenged. Please take action on your Merchant Administration Portal
			h.TransactionRepository.UpdateTransaction("pending", transaction.ID)
		} else if fraudStatus == "accept" {
			// TODO set transaction status on your database to 'success'
			SendTransactionMail("success", transaction)
			transaction.Status = "success"
			h.TransactionRepository.UpdateTransaction("success", transaction.ID)
		}
	} else if transactionStatus == "settlement" {
		// TODO set transaction status on your databaase to 'success'
		SendTransactionMail("success", transaction)
		transaction.Status = "success"
		h.TransactionRepository.UpdateTransaction("success", transaction.ID)
	} else if transactionStatus == "deny" {
		// TODO you can ignore 'deny', because most of the time it allows payment retries
		// and later can become success
		// KirimEmail("failed", transaction)
		transaction.Status = "failed"
		h.TransactionRepository.UpdateTransaction("failed", transaction.ID)
	} else if transactionStatus == "cancel" || transactionStatus == "expire" {
		// TODO set transaction status on your databaase to 'failure'
		SendTransactionMail("failed", transaction)
		transaction.Status = "failed"
		h.TransactionRepository.UpdateTransaction("failed", transaction.ID)
	} else if transactionStatus == "pending" {
		// TODO set transaction status on your databaase to 'pending' / waiting payment
		// KirimEmail("pending", transaction)
		transaction.Status = "pending"
		h.TransactionRepository.UpdateTransaction("pending", transaction.ID)
	}

	w.WriteHeader(http.StatusOK)
}

func (h *handlerTransaction) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id_transaction"]

	// mengambil data transaction yang baru ditambahkan
	transaction, _ := h.TransactionRepository.GetTransaction(id)

	var s = snap.Client{}
	s.New(os.Getenv("SERVER_KEY"), midtrans.Sandbox)

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  transaction.ID,
			GrossAmt: int64(transaction.Total),
		},
		CreditCard: &snap.CreditCardDetails{
			Secure: true,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: transaction.User.FullName,
			Email: transaction.User.Email,
		},
	}

	snapResp, _ := s.CreateTransaction(req)

	// mengupdate token di database
	transaction, _ = h.TransactionRepository.UpdateTokenTransaction(snapResp.Token, id)

	// mengambil data transaction yang baru diupdate
	transactionUpdated, _ := h.TransactionRepository.GetTransaction(id)

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertOneTransactionResponse(transactionUpdated),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerTransaction) UpdateTransactionByAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id := mux.Vars(r)["id_transaction"]

	if err := r.ParseForm(); err != nil {
		panic(err.Error())
	}

	// mengambil data dari request form
	var request dto.TransactionRequest
	json.NewDecoder(r.Body).Decode(&request)
	// fmt.Println(request.Status)

	// mengambil data yang ingin diupdate berdasarkan id yang didapatkan dari url
	_, err := h.TransactionRepository.GetTransaction(id)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		response := dto.ErrorResult{Code: http.StatusNotFound, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengirim data transaction yang sudah diupdate ke database
	transactionUpdated, err := h.TransactionRepository.UpdateTransaction(request.Status, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{Code: http.StatusInternalServerError, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengambil detail transaction yang baru saja ditambahkan (perlu diambil ulang, karena hasil dari transactionAdded hanya ada country_id saja, tanpa ada detail country nya)
	getTransactionUpdated, _ := h.TransactionRepository.GetTransaction(transactionUpdated.ID)

	// menyiapkan response
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertOneTransactionResponse(getTransactionUpdated),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerTransaction) GetDetailTransaction(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil id dari url parameter
	id := mux.Vars(r)["id_transaction"]

	// mengambil satu data Transaction berdasarkan id
	transaction, err := h.TransactionRepository.GetTransaction(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertOneTransactionResponse(transaction),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerTransaction) GetAllTransaction(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil seluruh data transaction
	transaction, err := h.TransactionRepository.FindTransactions()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertMultipleTransactionResponse(transaction),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerTransaction) GetAllTransactionByUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	claims := r.Context().Value("userInfo").(jwt.MapClaims)
	id := int(claims["id"].(float64))

	// mengambil seluruh data transaction
	transaction, err := h.TransactionRepository.FindTransactionsByUser(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertMultipleTransactionResponse(transaction),
	}

	// mengirim response
	json.NewEncoder(w).Encode(response)
}

// membuat fungsi konversi data yang akan disajikan sebagai response sesuai requirement
func convertOneTransactionResponse(t models.Transaction) dto.TransactionResponse {
	result := dto.TransactionResponse{
		ID:         t.ID,
		CounterQty: t.CounterQty,
		Total:      t.Total,
		Status:     t.Status,
		Token:      t.Token,
		User:       t.User,
		Trip: dto.TripResponse{
			ID:             t.Trip.ID,
			Title:          t.Trip.Title,
			Country:        t.Trip.Country,
			Accomodation:   t.Trip.Accomodation,
			Transportation: t.Trip.Transportation,
			Eat:            t.Trip.Eat,
			Day:            t.Trip.Day,
			Night:          t.Trip.Night,
			Price:          t.Trip.Price,
			TotalQuota:     t.Trip.TotalQuota,
			QuotaAvailable: t.Trip.QuotaAvailable,
			Description:    t.Trip.Description,
		},
	}
	result.BookingDate = t.BookingDate.Format("Monday, 2 January 2006")
	result.Trip.DateTrip = t.Trip.DateTrip.Format("2 January 2006")
	for _, img := range t.Trip.Image {
		result.Trip.Images = append(result.Trip.Images, img.FileName)
	}

	return result
}

// membuat fungsi konversi data yang akan disajikan sebagai response sesuai requirement
func convertMultipleTransactionResponse(t []models.Transaction) []dto.TransactionResponse {
	var result []dto.TransactionResponse

	for _, trx := range t {
		transaction := dto.TransactionResponse{
			ID:         trx.ID,
			CounterQty: trx.CounterQty,
			Total:      trx.Total,
			Status:     trx.Status,
			Token:      trx.Token,
			User:       trx.User,
			Trip: dto.TripResponse{
				ID:             trx.Trip.ID,
				Title:          trx.Trip.Title,
				Country:        trx.Trip.Country,
				Accomodation:   trx.Trip.Accomodation,
				Transportation: trx.Trip.Transportation,
				Eat:            trx.Trip.Eat,
				Day:            trx.Trip.Day,
				Night:          trx.Trip.Night,
				Price:          trx.Trip.Price,
				TotalQuota:     trx.Trip.TotalQuota,
				QuotaAvailable: trx.Trip.QuotaAvailable,
				Description:    trx.Trip.Description,
			},
		}
		transaction.BookingDate = trx.BookingDate.Format("Monday, 2 January 2006")
		transaction.Trip.DateTrip = trx.Trip.DateTrip.Format("2 January 2006")
		for _, img := range trx.Trip.Image {
			transaction.Trip.Images = append(transaction.Trip.Images, img.FileName)
		}
		result = append(result, transaction)
	}
	return result
}

// fungsi untuk kirim email transaksi
func SendTransactionMail(status string, transaction models.Transaction) {

	var CONFIG_SMTP_HOST = os.Getenv("CONFIG_SMTP_HOST")
	var CONFIG_SMTP_PORT, _ = strconv.Atoi(os.Getenv("CONFIG_SMTP_PORT"))
	var CONFIG_SENDER_NAME = os.Getenv("CONFIG_SENDER_NAME")
	var CONFIG_AUTH_EMAIL = os.Getenv("CONFIG_AUTH_EMAIL")
	var CONFIG_AUTH_PASSWORD = os.Getenv("CONFIG_AUTH_PASSWORD")

	ac := accounting.Accounting{Symbol: "Rp", Precision: 2}

	// create new message
	trxMail := gomail.NewMessage()
	trxMail.SetHeader("From", CONFIG_SENDER_NAME)
	trxMail.SetHeader("To", transaction.User.Email)
	trxMail.SetHeader("Subject", "Status Transaksi 😎")
	trxMail.SetBody("text/html", fmt.Sprintf(`<!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      </head>
      <body>
				<table class="m_8256600843157274032section" width="100%%"
					cellspacing="0" cellpadding="0" border="0">
					<tbody>
						<tr>
							<td class="m_8256600843157274032column" align="center">
								<table
									style="
										background-color: #ffffff;
										border-collapse: collapse;
										max-width: 600px !important;
									"
									width="100%%"
									cellspacing="0"
									cellpadding="0"
									border="0"
								>
									<tbody>
										<tr>
											<td
												style="padding: 20px 24px; background-color: #00ccbc"
												align="left"
											>
												<img
													src="https://dewetour-test.netlify.app/img/Icon.png"
													alt="livinbymandiri"
													style="max-width: 156px"
													class="CToWUd"
													data-bit="iit"
												/>
											</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr>
							<td class="m_8256600843157274032column" align="center">
								<table
									style="
										background-color: #ffffff;
										border-collapse: collapse;
										max-width: 600px !important;
									"
									width="100%%"
									cellspacing="0"
									cellpadding="0"
									border="0"
								>
									<tbody>
										<tr>
											<td style="padding: 15px 0px">
												<h2
													style="
														color: #1a1a1a;
														padding-left: 24px;
														padding-right: 24px;
													"
												>
													Transaction %s
												</h2>
												<br />
												<table
													style="color: #1a1a1a"
													width="100%%"
													cellspacing="0"
													cellpadding="0"
													border="0"
												>
													<tbody>
														<tr>
															<td
																style="
																	padding-left: 24px;
																	padding-right: 24px;
																	text-align: left;
																"
															>
																<p style="text-align: left; margin: 0">
																	Hello %s,
																</p>
																<br />
																<p style="text-align: left; margin: 0">
																	Here are the details of your transaction :
																</p>
															</td>
														</tr>
													</tbody>
												</table>
												<br />
												<table
													style="
														color: #1a1a1a;
														font-family: Arial, Helvetica, sans-serif;
													"
													width="100%%"
													cellspacing="0"
													cellpadding="0"
													border="0"
												>
													<tbody>
														<tr>
															<td style="padding-left: 8px; padding-right: 8px">
																<table width="100%%" cellspacing="0" cellpadding="0">
																	<tbody>
																		<tr>
																			<td
																				style="
																					background-color: #fafafa;
																					border-left: 0px solid #eeeeee;
																					padding-top: 16px;
																					padding-bottom: 16px;
																					padding-left: 16px;
																					padding-right: 16px;
																					text-align: left;
																				"
																			>
																				<p
																					style="
																						color: #ada6ae;
																						text-align: left;
																						margin: 0;
																					"
																				>
																					Trip Service Provider
																				</p>
																				<h4 style="text-align: left">
																					<span class="il">DEWE TOUR</span>
																				</h4>
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
													</tbody>
												</table>
												<br />
												<table
													style="
														font-family: Arial, Helvetica, sans-serif;
														color: #615a5a;
													"
													width="100%%"
													cellspacing="0"
													cellpadding="0"
													border="0"
												>
													<tbody>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	text-align: left;
																"
																width="35%%"
															>
																Date
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	text-align: left;
																"
																width="65%%"
															>
																%s
															</td>
														</tr>
														<tr>
															<td
																colspan="2"
																style="padding-left: 24px; padding-right: 24px"
															>
																<p
																	style="
																		border-bottom: 1px solid #f7f6f6;
																		line-height: 0px;
																		margin: 0;
																	"
																>
																	&nbsp;
																</p>
															</td>
														</tr>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																Trip
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																%s
															</td>
														</tr>
														<tr>
															<td
																colspan="2"
																style="padding-left: 24px; padding-right: 24px"
															>
																<p
																	style="
																		border-bottom: 1px solid #f7f6f6;
																		line-height: 0px;
																		margin: 0;
																	"
																>
																	&nbsp;
																</p>
															</td>
														</tr>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																Purchase Amount
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																%d
															</td>
														</tr>
														<tr>
															<td
																colspan="2"
																style="padding-left: 24px; padding-right: 24px"
															>
																<p
																	style="
																		border-bottom: 1px solid #f7f6f6;
																		line-height: 0px;
																		margin: 0;
																	"
																>
																	&nbsp;
																</p>
															</td>
														</tr>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																Price per Pax
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																%s
															</td>
														</tr>
														<tr>
															<td
																colspan="2"
																style="padding-left: 24px; padding-right: 24px"
															>
																<p
																	style="
																		border-bottom: 1px solid #f7f6f6;
																		line-height: 0px;
																		margin: 0;
																	"
																>
																	&nbsp;
																</p>
															</td>
														</tr>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																Total Transactions
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																%s
															</td>
														</tr>
														<tr>
															<td
																colspan="2"
																style="padding-left: 24px; padding-right: 24px"
															>
																<p
																	style="
																		border-bottom: 1px solid #f7f6f6;
																		line-height: 0px;
																		margin: 0;
																	"
																>
																	&nbsp;
																</p>
															</td>
														</tr>
														<tr>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 24px;
																	padding-right: 16px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																Transaction ID
															</td>
															<td
																style="
																	padding-top: 12px;
																	padding-bottom: 12px;
																	padding-left: 16px;
																	padding-right: 24px;
																	vertical-align: middle;
																	text-align: left;
																"
															>
																%s
															</td>
														</tr>
													</tbody>
												</table>
												<br />
												<table width="100%%" cellspacing="0" cellpadding="0" border="0">
													<tbody>
														<tr>
															<td
																style="
																	padding-left: 24px;
																	padding-right: 24px;
																	text-align: left;
																"
															>
																<p style="color: #ada6ae; text-align: left; margin: 0">
																	Save this email as a reference for your transaction.
																	Thank you for choosing Dewe Tour.
																</p>
															</td>
														</tr>
													</tbody>
												</table>
												<br />
											</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr></tr>
					</tbody>
				</table>
      </body>
    </html>`, status, transaction.User.FullName, timeIn("Asia/Jakarta").Format("Monday, 2 January 2006"), transaction.Trip.Title, transaction.CounterQty, ac.FormatMoney(transaction.Trip.Price), ac.FormatMoney(transaction.Total), transaction.ID))

	trxDialer := gomail.NewDialer(
		CONFIG_SMTP_HOST,
		CONFIG_SMTP_PORT,
		CONFIG_AUTH_EMAIL,
		CONFIG_AUTH_PASSWORD,
	)

	err := trxDialer.DialAndSend(trxMail)
	if err != nil {
		log.Fatal(err.Error())
	}

	log.Println("Pesan terkirim!")
}

// fungsi untuk mendapatkan waktu sesuai zona indonesia
func timeIn(name string) time.Time {
	loc, err := time.LoadLocation(name)
	if err != nil {
		panic(err)
	}
	return time.Now().In(loc)
}
