package handlers

import (
	"dewetour/dto"
	"dewetour/models"
	"dewetour/pkg/bcrypt"
	jwtToken "dewetour/pkg/jwt"
	"dewetour/repositories"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"gopkg.in/gomail.v2"
)

// membuat struct handler sebagai tipe data untuk menampung interface AuthRepository dari package repositories
type handlerAuth struct {
	AuthRepository repositories.AuthRepository
}

// membuat function yang mengembalikan object berbentuk struct handleAuth, fungsi ini membutuhkan interface AuthRepository sebagai parameter, karena method-method dalam interface tersebut dibutuhkan di dalam method struct handleAuth
func HandlerAuth(AuthRepository repositories.AuthRepository) *handlerAuth {
	return &handlerAuth{AuthRepository}
}

// membuat fungsi yang digunakan untuk mendaftarkan user baru
func (h *handlerAuth) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil data user dari request body
	var request dto.RegisterRequest
	json.NewDecoder(r.Body).Decode(&request)

	// memvalidasi inputan dari request body berdasarkan struct dto.CountryRequest
	validation := validator.New()
	err := validation.Struct(request)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menghashing password
	hashedPassword, err := bcrypt.HashingPassword(request.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan claims
	myClaims := jwt.MapClaims{}
	myClaims["fullName"] = request.FullName
	myClaims["email"] = request.Email
	myClaims["phone"] = request.Phone
	myClaims["password"] = hashedPassword
	myClaims["gender"] = request.Gender
	myClaims["address"] = request.Address
	myClaims["role"] = "user"
	myClaims["exp"] = time.Now().Add(time.Hour * 8).Unix() // 8 jam expired

	// menggenerate token jwt
	token, errGenerateToken := jwtToken.GenerateToken(&myClaims)
	if errGenerateToken != nil {
		log.Println(errGenerateToken)
		fmt.Println("Unauthorize")
		return
	}

	// cek apakah email sudah terdaftar
	if h.AuthRepository.IsUserRegistered(request.Email) {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{
			Code:    http.StatusBadRequest,
			Message: "User already registered",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengirim email verifikasi
	SendVerification(token, request, r)

	// // menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: "Verify your email to complete your registration",
	}
	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func (h *handlerAuth) VerifyRegistration(w http.ResponseWriter, r *http.Request) {
	// mengambil token dari url parameter
	token := mux.Vars(r)["token"]

	claims, err := jwtToken.DecodeToken(token)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{
			Code:    http.StatusBadRequest,
			Message: "Token is not valid",
		}
		json.NewEncoder(w).Encode(response)
	}

	// membuat object user baru dengan cetakan models.User
	newUser := models.User{
		FullName: claims["fullName"].(string),
		Email:    claims["email"].(string),
		Phone:    claims["phone"].(string),
		Password: claims["password"].(string),
		Gender:   claims["gender"].(string),
		Address:  claims["address"].(string),
		Role:     claims["role"].(string),
	}

	// mengirim data user baru ke database
	_, err = h.AuthRepository.Register(newUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{Code: http.StatusInternalServerError, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	http.Redirect(w, r, os.Getenv("REDIRECT_URL_ON_VERIFICATION"), http.StatusFound)
}

// membuat fungsi yang digunakan untuk autentikasi login
func (h *handlerAuth) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil data login dari request body
	var request dto.LoginRequest
	json.NewDecoder(r.Body).Decode(&request)
	if request.Email == "" || request.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: "Please enter a valid email and password"}
		json.NewEncoder(w).Encode(response)
		return
	}

	// mengambil data user yang memiliki email sesuai
	userLogin, err := h.AuthRepository.Login(request.Email)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		response := dto.ErrorResult{Code: http.StatusNotFound, Message: "email not registered"}
		json.NewEncoder(w).Encode(response)
		return
	}

	// validasi password
	isPasswordValid := bcrypt.CheckPassword(request.Password, userLogin.Password)
	if !isPasswordValid {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: "wrong password"}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan claims
	myClaims := jwt.MapClaims{}
	myClaims["id"] = userLogin.ID
	myClaims["email"] = userLogin.Email
	myClaims["role"] = userLogin.Role
	myClaims["exp"] = time.Now().Add(time.Hour * 8).Unix() // 8 jam expired

	// menggenerate token jwt
	token, errGenerateToken := jwtToken.GenerateToken(&myClaims)
	if errGenerateToken != nil {
		log.Println(errGenerateToken)
		fmt.Println("Unauthorize")
		return
	}

	// membuat data yang akan disisipkan di response
	var loginResponse dto.AuthResponse
	// loginResponse.UserID = userLogin.ID
	loginResponse.Email = userLogin.Email
	loginResponse.Role = userLogin.Role
	loginResponse.Token = token

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: loginResponse,
	}
	// mengirim response
	json.NewEncoder(w).Encode(response)
}

// membuat fungsi untuk mengkonversi data yang akan dikirim sebagai response dari register request
func convertRegisterResponse(user models.User) dto.RegisterResponse {
	var result dto.RegisterResponse

	result.FullName = user.FullName
	result.Email = user.Email
	result.Phone = user.Phone
	result.Gender = user.Gender
	result.Address = user.Address
	result.Role = user.Role

	return result
}

// membuat fungsi yang digunakan untuk mendaftarkan user baru
func (h *handlerAuth) RegisterAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil data user dari request body
	var request dto.RegisterRequest
	json.NewDecoder(r.Body).Decode(&request)

	// memvalidasi inputan dari request body berdasarkan struct dto.CountryRequest
	validation := validator.New()
	err := validation.Struct(request)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menghashing password
	hashedPassword, err := bcrypt.HashingPassword(request.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := dto.ErrorResult{Code: http.StatusBadRequest, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// membuat object user baru dengan cetakan models.User
	newUser := models.User{
		FullName: request.FullName,
		Email:    request.Email,
		Phone:    request.Phone,
		Password: hashedPassword,
		Gender:   request.Gender,
		Address:  request.Address,
		Role:     "admin",
	}

	// mengirim data user baru ke database
	userAdded, err := h.AuthRepository.Register(newUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := dto.ErrorResult{Code: http.StatusInternalServerError, Message: err.Error()}
		json.NewEncoder(w).Encode(response)
		return
	}

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: convertRegisterResponse(userAdded),
	}
	// mengirim response
	json.NewEncoder(w).Encode(response)
}

// membuat fungsi yang digunakan untuk memeriksa autentikasi
func (h *handlerAuth) CheckAuth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// mengambil claims dari jwt
	claims := r.Context().Value("userInfo").(jwt.MapClaims)

	// membuat data yang akan disisipkan di response
	var authResponse dto.AuthResponse
	// authResponse.UserID = int(claims["id"].(float64))
	authResponse.Email = claims["email"].(string)
	authResponse.Role = claims["role"].(string)
	authResponse.Token = strings.Replace(r.Header.Get("Authorization"), "Bearer ", "", -1)

	// menyiapkan response
	w.WriteHeader(http.StatusOK)
	response := dto.SuccessResult{
		Code: http.StatusOK,
		Data: authResponse,
	}
	// mengirim response
	json.NewEncoder(w).Encode(response)
}

func SendVerification(token string, user dto.RegisterRequest, r *http.Request) {

	var CONFIG_SMTP_HOST = os.Getenv("CONFIG_SMTP_HOST")
	var CONFIG_SMTP_PORT, _ = strconv.Atoi(os.Getenv("CONFIG_SMTP_PORT"))
	var CONFIG_SENDER_NAME = os.Getenv("CONFIG_SENDER_NAME")
	var CONFIG_AUTH_EMAIL = os.Getenv("CONFIG_AUTH_EMAIL")
	var CONFIG_AUTH_PASSWORD = os.Getenv("CONFIG_AUTH_PASSWORD")

	// link to verify
	// link := fmt.Sprintf("http://%s/api/v1/verification/%s", r.Host, token)
	var link string
	if r.TLS == nil {
		// the scheme was HTTP
		link = fmt.Sprintf("http://%s/api/v1/verification/%s", r.Host, token)
	} else {
		// the scheme was HTTPS
		link = fmt.Sprintf("https://%s/api/v1/verification/%s", r.Host, token)
	}

	// create new message
	verificationEmail := gomail.NewMessage()
	verificationEmail.SetHeader("From", CONFIG_SENDER_NAME)
	verificationEmail.SetHeader("To", user.Email)
	verificationEmail.SetHeader("Subject", "Email Verification")
	verificationEmail.SetBody("text/html", fmt.Sprintf(`<!DOCTYPE html>
    <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      </head>
      <body>
      <table
				style="width: 100%% !important"
				width="100%%"
				cellspacing="0"
				cellpadding="0"
				border="0"
			>
				<tbody>
					<tr>
						<td align="center">
							<table
								style="border: 1px solid #eaeaea; border-radius: 5px; margin: 40px 0"
								width="600"
								cellspacing="0"
								cellpadding="40"
								border="0"
							>
								<tbody>
									<tr>
										<td align="center" style="background-color: gainsboro">
											<div
												style="
													font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
														'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
														'Droid Sans', 'Helvetica Neue', sans-serif;
													text-align: left;
													width: 465px;
												"
											>
												<table
													style="width: 100%% !important"
													width="100%%"
													cellspacing="0"
													cellpadding="0"
													border="0"
												>
													<tbody>
														<tr>
															<td align="center">
																<div>
																	<img
																		src="https://dewetour-test.netlify.app/img/Icon.png"
																		alt="Vercel"
																		class="CToWUd"
																		data-bit="iit"
																	/>
																</div>
																<h1
																	style="
																		color: #000;
																		font-family: -apple-system, BlinkMacSystemFont,
																			'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
																			'Cantarell', 'Fira Sans', 'Droid Sans',
																			'Helvetica Neue', sans-serif;
																		font-size: 24px;
																		font-weight: normal;
																		margin: 30px 0;
																		padding: 0;
																	"
																>
																	<span class="il">Verify</span> your email to
																	Register to <b>Dewe Tour</b>
																</h1>
															</td>
														</tr>
													</tbody>
												</table>

												<p
													style="
														color: #000;
														font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
															'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
															'Droid Sans', 'Helvetica Neue', sans-serif;
														font-size: 14px;
														line-height: 24px;
													"
												>
													Hello <b>%s</b>,
												</p>
												<br />
												<p
													style="
														color: #000;
														font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
															'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
															'Droid Sans', 'Helvetica Neue', sans-serif;
														font-size: 14px;
														line-height: 24px;
													"
												>
													To complete the Register process, please click the button
													below:
												</p>
												<br />

												<table
													style="width: 100%% !important"
													width="100%%"
													cellspacing="0"
													cellpadding="0"
													border="0"
												>
													<tbody>
														<tr>
															<td align="center">
																<div>
																	<a
																		href="%s"
																		style="
																			background-color: #FFC107;
																			border-radius: 5px;
																			color: whitesmoke;
																			display: inline-block;
																			font-family: -apple-system, BlinkMacSystemFont,
																				'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
																				'Cantarell', 'Fira Sans', 'Droid Sans',
																				'Helvetica Neue', sans-serif;
																			font-size: 16px;
																			font-weight: 1000;
																			line-height: 50px;
																			text-align: center;
																			text-decoration: none;
																			width: 200px;
																		"
																		target="_blank"
																		><span class="il">VERIFY</span></a
																	>
																</div>
															</td>
														</tr>
													</tbody>
												</table>

												<br />
												<p
													style="
														color: #000;
														font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
															'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
															'Droid Sans', 'Helvetica Neue', sans-serif;
														font-size: 14px;
														line-height: 24px;
													"
												>
													Or copy and paste this URL into a new tab of your browser:
												</p>
												<p
													style="
														color: #000;
														font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
															'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
															'Droid Sans', 'Helvetica Neue', sans-serif;
														font-size: 14px;
														line-height: 24px;
													"
												>
													<a
														href="%s"
														style="color: #067df7; text-decoration: none"
														target="_blank"
														>%s</a
													>
												</p>
												<br />
												<hr
													style="
														border: none;
														border-top: 1px solid #eaeaea;
														margin: 26px 0;
														width: 100%%;
													"
												/>
												<p
													style="
														color: #666666;
														font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
															'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
															'Droid Sans', 'Helvetica Neue', sans-serif;
														font-size: 12px;
														line-height: 24px;
													"
												>
													If you didn't attempt to register but received this email,
													please ignore this email.
												</p>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</tbody>
			</table>

      </body>
    </html>`, user.FullName, link, link, link))

	verificationDialer := gomail.NewDialer(
		CONFIG_SMTP_HOST,
		CONFIG_SMTP_PORT,
		CONFIG_AUTH_EMAIL,
		CONFIG_AUTH_PASSWORD,
	)

	err := verificationDialer.DialAndSend(verificationEmail)
	if err != nil {
		log.Fatal(err.Error())
	}

	log.Println("Pesan terkirim!")
}
