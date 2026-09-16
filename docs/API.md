# API Reference

Auto-generated from the live OpenAPI document (`GET /swagger-json`) on this branch, cross-checked against `@UseGuards(AuthGuard)` placement in each `*.controller.ts`. Source of truth is the running app — regenerate after route/DTO changes rather than hand-editing.

Base path: `/api/v1` (Swagger UI itself is unprefixed, at `/swagger`; raw JSON at `/swagger-json`).

Auth column: 🔒 = requires `Authorization: Bearer <JWT>` (`AuthGuard`); public = no guard.


## User

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/user/create` | 🔒 |
| DELETE | `/api/v1/user/delete/{id}` | 🔒 |
| GET | `/api/v1/user/list` | 🔒 |
| POST | `/api/v1/user/login` | public |
| POST | `/api/v1/user/register` | public |
| PATCH | `/api/v1/user/update/{id}` | 🔒 |
| POST | `/api/v1/user/verify-otp` | public |
| GET | `/api/v1/user/{id}` | 🔒 |

### POST `/api/v1/user/create`
🔒 requires Bearer JWT

**Request body:** `CreateBodyUserDto`
- `firstName` (required) — object: `UserNameDto`
- `lastName` (required) — object: `UserNameDto`
- `phoneNumber` (required) — string
- `addressDetail` (required) — object: `AddressDto`

**Responses:** 201

### DELETE `/api/v1/user/delete/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/user/list`
🔒 requires Bearer JWT

**Request body:** `BodyUserIdsDto`
- `ids` (required) — array of string

**Responses:** 200

### POST `/api/v1/user/login`
Public

**Request body:** `LoginBodyDto`
- `email` (required) — string
- `password` (required) — string

**Responses:** 201

### POST `/api/v1/user/register`
Public

**Request body:** `RegisterBodyDto`
- `email` (required) — string
- `password` (required) — string
- `confirmPassword` (required) — string

**Responses:** 201

### PATCH `/api/v1/user/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdateBodyUserDto`
- `firstName` (required) — object: `UserNameDto`
- `lastName` (required) — object: `UserNameDto`
- `phoneNumber` (required) — string
- `addressDetail` (required) — object: `AddressDto`

**Responses:** 200

### POST `/api/v1/user/verify-otp`
Public

**Request body:** `VerifyOtpBodyDto`
- `email` (required) — string
- `otp` (required) — string

**Responses:** 201

### GET `/api/v1/user/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## Role

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/role/create` | public |
| DELETE | `/api/v1/role/delete/{id}` | public |
| GET | `/api/v1/role/list` | public |
| PATCH | `/api/v1/role/update/{id}` | public |
| GET | `/api/v1/role/{id}` | public |

### POST `/api/v1/role/create`
Public

**Request body:** `CreateBodyRoleDto`
- `name` (required) — string
- `description` (required) — string
- `priority` (required) — number

**Responses:** 201

### DELETE `/api/v1/role/delete/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/role/list`
Public

**Request body:** `BodyRoleIdsDto`
- `ids` (required) — array of string

**Responses:** 200

### PATCH `/api/v1/role/update/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdateBodyRoleDto`
- `name` (required) — string
- `description` (required) — string
- `priority` (required) — number

**Responses:** 200

### GET `/api/v1/role/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## Hotel

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/hotel/create` | 🔒 |
| DELETE | `/api/v1/hotel/delete/{id}` | 🔒 |
| POST | `/api/v1/hotel/list` | public |
| PATCH | `/api/v1/hotel/update/{id}` | 🔒 |
| GET | `/api/v1/hotel/{id}` | public |

### POST `/api/v1/hotel/create`
🔒 requires Bearer JWT

**Request body:** `CreateHotelBodyDto`
- `name` (required) — string
- `description` (required) — string
- `image` (required) — string
- `phoneNumber` (required) — string
- `email` (required) — string
- `website` (required) — string
- `category` (optional) — string (enum: luxury, family_friendly, boutique, beachfront)
- `addressDetail` (required) — object: `AddressDto`
- `rooms` (required) — array of string

**Responses:** 201

### DELETE `/api/v1/hotel/delete/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### POST `/api/v1/hotel/list`
Public

**Query/path params:**
  - `page` (query, optional) — number
  - `limit` (query, optional) — number
  - `ids` (query, optional) — array
  - `name` (query, optional) — string
  - `checkInDate` (query, optional) — string
  - `checkOutDate` (query, optional) — string
  - `price` (query, optional) — number
  - `rating` (query, optional) — number
  - `amenities` (query, optional) — string
  - `category` (query, optional) — string
  - `guests` (query, optional) — array
  - `rooms` (query, optional) — number

**Responses:** 201

### PATCH `/api/v1/hotel/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdateHotelBodyDto`
- `name` (required) — string
- `description` (required) — string
- `image` (required) — string
- `phoneNumber` (required) — string
- `email` (required) — string
- `website` (required) — string
- `category` (optional) — string (enum: luxury, family_friendly, boutique, beachfront)
- `addressDetail` (required) — object: `AddressDto`
- `rooms` (required) — array of `UpdateHotelRoomInHotelDto`

**Responses:** 200

### GET `/api/v1/hotel/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## HotelRoom

| Method | Path | Auth |
|---|---|---|
| GET | `/api/v1/hotel-room/availability/{id}` | public |
| POST | `/api/v1/hotel-room/create` | 🔒 |
| DELETE | `/api/v1/hotel-room/delete/{id}` | 🔒 |
| GET | `/api/v1/hotel-room/list` | public |
| PATCH | `/api/v1/hotel-room/update/{id}` | 🔒 |
| GET | `/api/v1/hotel-room/{id}` | public |

### GET `/api/v1/hotel-room/availability/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### POST `/api/v1/hotel-room/create`
🔒 requires Bearer JWT

**Request body:** `CreateManyHotelRoomBodyDto`
- `rooms` (required) — array of string

**Responses:** 201

### DELETE `/api/v1/hotel-room/delete/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/hotel-room/list`
Public

**Query/path params:**
  - `hotel_id` (query, required) — array
  - `checkInDate` (query, required) — string
  - `checkOutDate` (query, required) — string
  - `guestNumber` (query, required) — number
  - `roomCount` (query, required) — number
  - `price` (query, optional) — number
  - `amenities` (query, optional) — string

**Responses:** 200

### PATCH `/api/v1/hotel-room/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdateHotelRoomBodyDto`
- `name` (required) — string
- `description` (required) — string
- `image` (required) — string
- `price` (required) — number
- `capacity` (required) — number
- `policies` (required) — array of string
- `amenities` (required) — array of string
- `type` (required) — string

**Responses:** 200

### GET `/api/v1/hotel-room/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## Address

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/address/create` | public |
| DELETE | `/api/v1/address/delete/{id}` | public |
| GET | `/api/v1/address/district/province/{geo_id}/{province_id}` | public |
| GET | `/api/v1/address/geography/list` | public |
| GET | `/api/v1/address/list` | public |
| GET | `/api/v1/address/province/{id}` | public |
| PATCH | `/api/v1/address/update/{id}` | public |
| GET | `/api/v1/address/{id}` | public |

### POST `/api/v1/address/create`
Public

**Request body:** `CreateAddressBodyDto`
- `country` (required) — string
- `province` (required) — string
- `district` (required) — string
- `subDistrict` (required) — string
- `postalCode` (required) — string
- `detail` (required) — string

**Responses:** 201

### DELETE `/api/v1/address/delete/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/address/district/province/{geo_id}/{province_id}`
Public

**Query/path params:**
  - `geo_id` (path, required) — string
  - `province_id` (path, required) — string
  - `district_id` (path, required) — string

**Responses:** 200

### GET `/api/v1/address/geography/list`
Public

**Request body:** `GeographyBodyParamsDto`
- `geo_ids` (required) — array of string

**Responses:** 200

### GET `/api/v1/address/list`
Public

**Request body:** `AddressBodyParamsDto`
- `ids` (required) — array of string

**Responses:** 200

### GET `/api/v1/address/province/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### PATCH `/api/v1/address/update/{id}`
Public

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdateAddressBodyDto`
- `country` (required) — string
- `province` (required) — string
- `district` (required) — string
- `subDistrict` (required) — string
- `postalCode` (required) — string
- `detail` (required) — string

**Responses:** 200

### GET `/api/v1/address/{id}`
Public

**Responses:** 200


## Hotel Review

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/hotel-review/create` | 🔒 |
| GET | `/api/v1/hotel-review/list` | 🔒 |
| POST | `/api/v1/hotel-review/reply` | 🔒 |
| GET | `/api/v1/hotel-review/{id}/hotel/{hotel_id}` | 🔒 |
| PATCH | `/api/v1/hotel-review/{id}/hotel/{hotel_id}` | 🔒 |
| DELETE | `/api/v1/hotel-review/{id}/hotel/{hotel_id}` | 🔒 |

### POST `/api/v1/hotel-review/create`
🔒 requires Bearer JWT

**Request body:** `CreateHotelReviewBodyDto`
- `hotel_id` (required) — string
- `title` (required) — string
- `description` (required) — string
- `rating` (required) — number
- `isAnonymous` (required) — boolean
- `isReply` (required) — boolean

**Responses:** 201

### GET `/api/v1/hotel-review/list`
🔒 requires Bearer JWT

**Request body:** `HotelReviewParamsDto`
- `hotel_id` (required) — string

**Responses:** 200

### POST `/api/v1/hotel-review/reply`
🔒 requires Bearer JWT

**Request body:** `ReplyHotelReviewBodyDto`
- `hotel_id` (required) — string
- `review_id` (required) — string
- `reply` (required) — string
- `isReply` (required) — boolean

**Responses:** 201

### GET `/api/v1/hotel-review/{id}/hotel/{hotel_id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string
  - `hotel_id` (path, required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-review/{id}/hotel/{hotel_id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string
  - `hotel_id` (path, required) — string

**Request body:** `UpdateHotelReviewBodyDto`
- `hotel_id` (required) — string
- `title` (required) — string
- `description` (required) — string
- `rating` (required) — number
- `isAnonymous` (required) — boolean

**Responses:** 200

### DELETE `/api/v1/hotel-review/{id}/hotel/{hotel_id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string
  - `hotel_id` (path, required) — string

**Responses:** 200


## Hotel Booking

| Method | Path | Auth |
|---|---|---|
| DELETE | `/api/v1/hotel-booking/cancel/{id}` | 🔒 |
| PATCH | `/api/v1/hotel-booking/check-in/{bookingCode}` | 🔒 |
| PATCH | `/api/v1/hotel-booking/check-out/{bookingCode}` | 🔒 |
| PATCH | `/api/v1/hotel-booking/confirm/{bookingCode}` | 🔒 |
| POST | `/api/v1/hotel-booking/create` | 🔒 |
| GET | `/api/v1/hotel-booking/list` | 🔒 |
| PATCH | `/api/v1/hotel-booking/refund-cancel` | 🔒 |
| PATCH | `/api/v1/hotel-booking/update/{id}` | 🔒 |
| GET | `/api/v1/hotel-booking/{id}` | 🔒 |

### DELETE `/api/v1/hotel-booking/cancel/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-booking/check-in/{bookingCode}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-booking/check-out/{bookingCode}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-booking/confirm/{bookingCode}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Responses:** 200

### POST `/api/v1/hotel-booking/create`
🔒 requires Bearer JWT

**Request body:** `CreateHotelBookingBodyDto`
- `hotel_id` (required) — string
- `room_id` (required) — string
- `guestCount` (required) — number
- `stayPeriod` (required) — number
- `paymentMethod` (required) — string
- `checkInDate` (required) — string
- `checkOutDate` (required) — string

**Responses:** 201

### GET `/api/v1/hotel-booking/list`
🔒 requires Bearer JWT

**Request body:** `HotelBookingParamsDto`
- `hotel_id` (required) — string
- `bookingCode` (required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-booking/refund-cancel`
🔒 requires Bearer JWT

**Request body:** `RefundBookingBodyDto`
- `bookingId` (required) — string
- `reason` (required) — string

**Responses:** 200

### PATCH `/api/v1/hotel-booking/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Request body:** `UpdateHotelBookingBodyDto`
- `hotel_id` (required) — string
- `room_id` (required) — string
- `guestCount` (required) — number
- `stayPeriod` (required) — number
- `checkInDate` (required) — string
- `checkOutDate` (required) — string
- `paymentMethod` (required) — string

**Responses:** 200

### GET `/api/v1/hotel-booking/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `hotel_id` (path, required) — string
  - `bookingCode` (path, required) — string

**Responses:** 200


## Payment

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/payment/create` | 🔒 |
| DELETE | `/api/v1/payment/delete/{id}` | 🔒 |
| GET | `/api/v1/payment/list` | 🔒 |
| PATCH | `/api/v1/payment/update/{id}` | 🔒 |
| GET | `/api/v1/payment/{id}` | 🔒 |

### POST `/api/v1/payment/create`
🔒 requires Bearer JWT

**Request body:** `CreatePaymentBodyDto`
- `cardNumber` (required) — string
- `cardHolderName` (required) — string
- `cardExpiryMonth` (required) — string
- `cardExpiryYear` (required) — string
- `cardCvv` (required) — string

**Responses:** 201

### DELETE `/api/v1/payment/delete/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/payment/list`
🔒 requires Bearer JWT

**Query/path params:**
  - `user_id` (query, required) — string

**Responses:** 200

### PATCH `/api/v1/payment/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdatePaymentBodyDto`
- `user_id` (optional) — string
- `cardNumber` (optional) — string
- `cardHolderName` (optional) — string
- `cardExpiryMonth` (optional) — string
- `cardExpiryYear` (optional) — string
- `cardCvv` (optional) — string

**Responses:** 200

### GET `/api/v1/payment/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## Payment Log

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/payment-log/create` | 🔒 |
| DELETE | `/api/v1/payment-log/delete/{id}` | 🔒 |
| GET | `/api/v1/payment-log/list` | 🔒 |
| PATCH | `/api/v1/payment-log/update/{id}` | 🔒 |
| GET | `/api/v1/payment-log/{id}` | 🔒 |

### POST `/api/v1/payment-log/create`
🔒 requires Bearer JWT

**Request body:** `CreatePaymentLogBodyDto`
- `action` (required) — string
- `log` (required) — string
- `transactionId` (required) — string
- `hotelId` (required) — string
- `hotelRoomId` (required) — string
- `hotelBookingId` (required) — string
- `userId` (required) — string

**Responses:** 201

### DELETE `/api/v1/payment-log/delete/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200

### GET `/api/v1/payment-log/list`
🔒 requires Bearer JWT

**Responses:** 200

### PATCH `/api/v1/payment-log/update/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Request body:** `UpdatePaymentLogBodyDto`
- `action` (required) — string
- `log` (required) — string
- `transactionId` (required) — string
- `hotelId` (required) — string
- `hotelRoomId` (required) — string
- `hotelBookingId` (required) — string
- `userId` (required) — string

**Responses:** 200

### GET `/api/v1/payment-log/{id}`
🔒 requires Bearer JWT

**Query/path params:**
  - `id` (path, required) — string

**Responses:** 200


## stripe

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/stripe/checkout` | 🔒 |
| POST | `/api/v1/stripe/webhook` | public |

### POST `/api/v1/stripe/checkout`
🔒 requires Bearer JWT

**Request body:** `CreateCheckoutSessionDto`
- `orderId` (required) — string
- `bookingCode` (required) — string
- `amount` (required) — number
- `currency` (required) — string
- `productName` (required) — string
- `successUrl` (required) — string
- `cancelUrl` (required) — string

**Responses:** 201

### POST `/api/v1/stripe/webhook`
Public

**Query/path params:**
  - `stripe-signature` (header, required) — string

**Responses:** 200
