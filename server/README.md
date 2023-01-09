# DUMBWAYS_B42 - BackEnd Task DeWe Tour

## Improve

- Email validation, user cant register with email that have been registered
- Add upload image endpoint for user, will consumed on change profil pict
- separate middleware between AdminAuth and UserAuth, that will used for separate feature between user and admin
- used context data for get user id that will used for userid on addtransaction, and getdetailprofile by id
- add multiple iamge on addtrip and updatetrip endpoint.
- On UpdateTrip, if image uploaded more than previous image, previous image will be replaced by uploaded image. If image uploaded less than previous image, excess of previous image will be delete from database
- add bookingDate on transaction models

## Testing

### AUTH & USER

#### Register user (2 user)

**Endpoint :** `/api/v1/register`
**Method :** `POST`

Try to register new user with same emmail to know is validation work or not.

```JSON
{
  "fullName": "Ahmad Sidik",
  "email": "ahmad@gmail.com",
  "password": "inirahasia",
  "phone": "087711356758",
  "address": "Jln. Marvel Universe, RT.21 RW.69"
}
{
  "fullName": "Sidik Rudini",
  "email": "sidik@gmail.com",
  "password": "inirahasia",
  "phone": "087711356758",
  "address": "Jln. Marvel Universe, RT.21 RW.69"
}
```

#### Register admin (1 admin)

**Endpoint :** `/api/v1/register_admin`
**Method :** `POST`

```JSON
{
  "fullName": "Ahmad Sidik Rudini",
  "email": "admin@gmail.com",
  "password": "inirahasia",
  "phone": "087711356758",
  "address": "Jln. Marvel Universe, RT.21 RW.69"
}
```

#### Login (user)

**Endpoint :** `/api/v1/login`
**Method :** `POST`

 ```JSON
 {
  "email": "sidik@gmail.com",
  "password": "inirahasia"
 }
 ```

- Get detail user, \
 **Endpoint :** `/api/v1/user`
 **Method :** `GET`

- Update user image, \
 **Endpoint :** `/api/v1/user`
 **Method :** `PATCH`

 ```FormData
 image : "imagefile.jpg"
 ```

- FindUsers (expexct failed), \
 **Endpoint :** `/api/v1/users`
 **Method :** `GET`

- DeleteUser (expect failed), \
 **Endpoint :** `/api/v1/user`
 **Method :** `DELETE`

#### Login (admin)

**Endpoint :** `/api/v1/login`
**Method :** `POST`

```JSON
{
  "email": "admin@gmail.com",
  "password": "inirahasia"
}
```

- FindUsers, \
 **Endpoint :** `/api/v1/users`
 **Method :** `GET`

- DeleteUser, \
 **Endpoint :** `/api/v1/user`
 **Method :** `DELETE`

### COUNTRY

- AddCountry (3 country), *must be logged in as admin*, \
 **Endpoint :** `/api/v1/country`
 **Method :** `POST`

 ```JSON
  {
    "name":"Indonesia"
  }
  {
    "name":"Singapore"
  }
  {
    "name":"Australia"
  }
 ```

- GetAllCountry, \
 **Endpoint :** `/api/v1/country`
 **Method :** `GET`

- GetDetailCountry, \
 **Endpoint :** `/api/v1/country/{id_country}`
 **Method :** `GET`

- UpdateCountry, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/country/{id_country}`
 **Method :** `PATCH`

 ```JSON
  {
    "name":"Kenya"
  }
 ```

- DeleteCountry, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/country/{id_country}`
 **Method :** `DELETE`

### TRIP

- AddTrip (3 Trip) with 3 images on each trip, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/trip`
 **Method :** `POST`

 ```FormData
  title:Labuan Bajo
  id_country:1
  accomodation:hotel
  transportation:becak
  eat:bakmi
  day:4
  night:3
  dateTrip:11 November 2023
  price:4900000
  quota:10
  description:dijamin seru
  images: 3 files
 ```

 ```FormData
  title:Universal Studio
  id_country:2
  accomodation:hotel
  transportation:becak
  eat:bakmi
  day:2
  night:1
  dateTrip:14 March 2023
  price:8900000
  quota:7
  description:Asik euy ke luar negeri
  images: 3 files
 ```

 ```FormData
  title:Bromo
  id_country:1
  accomodation:hotel
  transportation:becak
  eat:bakmi
  day:3
  night:2
  dateTrip:19 January 2023
  price:150000
  quota:5
  description:Menikmati Negeri diatas awan gaes
  images: 3 files
 ```

- GetAllTrip, \
 **Endpoint :** `/api/v1/trip`
 **Method :** `GET`

- GetDetailTrip, \
 **Endpoint :** `/api/v1/trip/{id_trip}`
 **Method :** `GET`

- UpdateTrip with more Images and change country, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/trip/{id_trip}`
 **Method :** `PATCH`

 ```FormData
  title:Bromo Manteb
  id_country:2
  accomodation:hotel
  transportation:becak
  eat:bakmi
  day:2
  night:1
  dateTrip:11 November 2023
  price:150000
  quota:5
  description:Menikmati Negeri diatas awan gaes
  images: 5 files
 ```

- UpdateTrip with less Images and change country, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/trip/{id_trip}`
 **Method :** `PATCH`

 ```FormData
  title:Bromo Explor
  id_country:1
  accomodation:hotel
  transportation:becak
  eat:bakmi
  day:3
  night:2
  dateTrip:11 November 2023
  price:1500000
  quota:5
  description:Menikmati Negeri diatas awan gaes
  images: 2 files
 ```

- DeleteTrip, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/trip/{id_trip}`
 **Method :** `DELETE`

### TRANSACTION

- AddTransaction, *must be logged in as user*, \
 **Endpoint :** `/api/v1/transaction`
 **Method :** `POST`

  ```FormData
    counterQty:2
    total:9800000
    status:new
    tripId:1
    attachment:1 file
  ```

  ```FormData
    counterQty:3
    total:26700000
    status:new
    tripId:2
    attachment:1 file
  ```

  ```FormData
    counterQty:4
    total:6000000
    status:new
    tripId:1
    attachment:1 file
  ```

- GetDetailTransaction, *must be logged in as user*, \
 **Endpoint :** `/api/v1/transaction/{id_transaction}`
 **Method :** `GET`

- UpdateTransaction, *must be logged in as user*, \
 **Endpoint :** `/api/v1/transaction/{id_transaction}` (change transaction 1)  
 **Method :** `PATCH`

 ```FormData
    counterQty:3
    total:4500000
    status:approve
    tripId:3
    attachment:1 file
  ```

- GetAllTransactions, *must be logged in as admin*, \
 **Endpoint :** `/api/v1/transaction`
 **Method :** `GET`
