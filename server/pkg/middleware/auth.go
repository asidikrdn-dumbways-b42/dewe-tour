package middleware

import (
	"context"
	"dewetour/dto"
	jwtToken "dewetour/pkg/jwt"
	"encoding/json"
	"net/http"
)

func UserAuth(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// mengambil token dari request header
		token := r.Header.Get("Authorization")
		if token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			response := dto.ErrorResult{Code: http.StatusBadRequest, Message: "unauthorized"}
			json.NewEncoder(w).Encode(response)
			return
		}

		// memvalidasi token dan mengambil nilai claim jika token tersebut valid
		claims, err := jwtToken.DecodeToken(token)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			response := dto.ErrorResult{Code: http.StatusUnauthorized, Message: "unauthorized"}
			json.NewEncoder(w).Encode(response)
			return
		}
		// fmt.Println(claims)

		// cara mengambil data dari claims jwt
		// Cast data to map[string]interface{}
		// id := int(claims["id"].(float64)) // --> assert id from interface{} to float64, then convert it to int
		// role := claims["role"].(string)

		// fmt.Println(id)
		// fmt.Println(role)

		// menyiapkan context dengan key "userInfo" yang berisi jwt claim
		ctx := context.WithValue(r.Context(), "userInfo", claims)

		// mengirim nilai context ke object http.HandlerFunc yang menjadi parameter saat fungsi middleware ini dipanggil
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func AdminAuth(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// mengambil token dari request header
		token := r.Header.Get("Authorization")
		if token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			response := dto.ErrorResult{Code: http.StatusBadRequest, Message: "unauthorized"}
			json.NewEncoder(w).Encode(response)
			return
		}

		// memvalidasi token dan mengambil nilai claim jika token tersebut valid
		claims, err := jwtToken.DecodeToken(token)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			response := dto.ErrorResult{Code: http.StatusUnauthorized, Message: "unauthorized"}
			json.NewEncoder(w).Encode(response)
			return
		}

		role := claims["role"].(string)
		if role != "admin" {
			w.WriteHeader(http.StatusUnauthorized)
			response := dto.ErrorResult{Code: http.StatusUnauthorized, Message: "unauthorized, you're not admin !"}
			json.NewEncoder(w).Encode(response)
			return
		}

		// menyiapkan context dengan key "userInfo" yang berisi jwt claim
		ctx := context.WithValue(r.Context(), "userInfo", claims)

		// mengirim nilai context ke object http.HandlerFunc yang menjadi parameter saat fungsi middleware ini dipanggil
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
