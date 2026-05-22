# Hotel Reservation System Backend

Backend API สำหรับระบบจองโรงแรม พัฒนาด้วย NestJS, TypeScript, TypeORM และ PostgreSQL

## Tech Stack

- Node.js 22
- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger/OpenAPI
- Jest

## Project Structure

```text
src/
  address/          Address and Thailand location data APIs
  database/         TypeORM entities
  decorator/        Custom decorators
  enum/             Shared enum values
  guard/            Authentication guard
  hotel/            Hotel APIs
  hotel-booking/    Booking APIs
  hotel-review/     Review and reply APIs
  hotel-room/       Room APIs
  payment/          Payment card APIs
  role/             Role APIs
  user/             User and authentication APIs
```

## Environment Variables

สร้างไฟล์ `.env` ที่ root ของ backend แล้วใส่ค่าตาม environment จริงของเครื่องหรือ server

```env
PORT=3000
FRONTEND_URL=http://localhost:3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<database-password>
DB_DATABASE=hotel_reservation

JWT_SECRET=<jwt-secret>
```

หมายเหตุ: อย่า commit ค่า credential จริง เช่น database password หรือ JWT secret ลง repository

## Installation

```bash
yarn install
```

## Run

```bash
# development
yarn start

# development with watch mode
yarn start:dev

# production build
yarn build
yarn start:prod
```

API จะมี global prefix เป็น:

```text
/api/v1
```

Swagger UI:

```text
/api
```

## Test

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov

# lint
yarn lint
```

## Docker

```bash
docker build -t hotel-reservation-backend .
docker run --env-file .env -p 3000:3000 hotel-reservation-backend
```

## Authentication

บาง endpoint ต้องใช้ JWT token ผ่าน header:

```http
Authorization: Bearer <access-token>
```

Login API จะ return `accessToken` กลับมาในรูปแบบ `Bearer <token>` และ token มีอายุ 7 วัน

## Services And APIs

ทุก endpoint ด้านล่างอยู่ภายใต้ prefix `/api/v1`

### User Service

จัดการ user, register, login และ profile/address ของ user

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/user/register` | No | สมัครสมาชิกด้วย email และ password |
| POST | `/user/login` | No | เข้าสู่ระบบและรับ JWT access token |
| POST | `/user/create` | Yes | สร้าง user |
| GET | `/user/list` | Yes | ดึงรายการ user ตาม `ids` |
| GET | `/user/:id` | Yes | ดึง user ตาม id |
| PATCH | `/user/update/:id` | Yes | แก้ไข user และ address |
| DELETE | `/user/delete/:id` | Yes | soft delete user |

### Role Service

จัดการ role และ priority ของ role

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/role/create` | No | สร้าง role |
| GET | `/role/list` | No | ดึงรายการ role ตาม `ids` |
| GET | `/role/:id` | No | ดึง role ตาม id |
| PATCH | `/role/update/:id` | No | แก้ไข role |
| DELETE | `/role/delete/:id` | No | ลบ role |

### Hotel Service

จัดการข้อมูลโรงแรม ที่อยู่ และห้องพักที่เกี่ยวข้อง

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/hotel/create` | No | สร้าง hotel พร้อม address และ rooms |
| GET | `/hotel/list` | No | ดึงรายการ hotel ตาม `ids` |
| GET | `/hotel/:id` | No | ดึง hotel ตาม id |
| PATCH | `/hotel/update/:id` | No | แก้ไข hotel, address และ rooms |
| DELETE | `/hotel/delete/:id` | No | ลบ hotel |

### Hotel Room Service

จัดการห้องพัก ราคา ความจุ สถานะ amenities และ policies

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/hotel-room/create` | No | สร้างห้องพักหลายรายการ |
| GET | `/hotel-room/list` | No | ดึงรายการห้องพักตาม `ids` |
| GET | `/hotel-room/:id` | No | ดึงห้องพักตาม id |
| PATCH | `/hotel-room/update/:id` | No | แก้ไขห้องพัก |
| DELETE | `/hotel-room/delete/:id` | No | ลบห้องพัก |
| GET | `/hotel-room/availability/:id` | No | ตรวจสอบ availability ของห้องพัก |

### Address Service

จัดการ address และข้อมูล geography/province/district

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/address/create` | No | สร้าง address |
| GET | `/address/:id` | No | ดึง address ตาม id |
| GET | `/address/list` | No | ดึงรายการ address ตาม `ids` |
| GET | `/address/geography/list` | No | ดึงรายการ geography ตาม `geo_ids` |
| GET | `/address/province/:id` | No | ดึง province ตาม id |
| GET | `/address/district/province/:geo_id/:province_id` | No | ดึง district ตาม geography และ province |
| PATCH | `/address/update/:id` | No | แก้ไข address |
| DELETE | `/address/delete/:id` | No | ลบ address |

### Hotel Review Service

จัดการ review โรงแรมและ reply review ต้องผ่าน authentication ทุก endpoint

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/hotel-review/create` | Yes | สร้าง review ให้ hotel |
| POST | `/hotel-review/reply` | Yes | ตอบกลับ review |
| GET | `/hotel-review/list` | Yes | ดึง review ตาม `hotel_id` |
| GET | `/hotel-review/:id/hotel/:hotel_id` | Yes | ดึง review รายการเดียว |
| PATCH | `/hotel-review/:id/hotel/:hotel_id` | Yes | แก้ไข review |
| DELETE | `/hotel-review/:id/hotel/:hotel_id` | Yes | ลบ review |

### Hotel Booking Service

จัดการ booking ห้องพัก ต้องผ่าน authentication ทุก endpoint

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/hotel-booking/create` | Yes | สร้าง booking |
| GET | `/hotel-booking/list` | Yes | ดึงรายการ booking ของ user |
| GET | `/hotel-booking/:id` | Yes | ดึง booking รายการเดียว |
| PATCH | `/hotel-booking/update/:id` | Yes | แก้ไข booking |
| DELETE | `/hotel-booking/cancel/:id` | Yes | ยกเลิก booking |

### Payment Service

จัดการข้อมูล payment card ของ user ต้องผ่าน authentication ทุก endpoint

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/payment/create` | Yes | สร้าง payment method |
| GET | `/payment/list` | Yes | ดึงรายการ payment method, optional query `user_id` |
| GET | `/payment/:id` | Yes | ดึง payment method ตาม id |
| PATCH | `/payment/update/:id` | Yes | แก้ไข payment method |
| DELETE | `/payment/delete/:id` | Yes | ลบ payment method |

## Common Enum Values

### CommonStatus

- `active`
- `inactive`
- `pending`
- `deleted`

### HotelRoomStatus

- `available`
- `unavailable`
- `maintenance`
- `out_of_order`

### HotelRoomType

- `single`
- `double`
- `king`
- `queen`
- `suite`

### HotelRoomAmenities

- `wifi`
- `tv`
- `air_conditioning`
- `minibar`
- `safe`
- `private_bathroom`
- `private_balcony`
- `private_terrace`

### RoomPolicyType

- `pets`
- `children`
- `smoking`
- `adults`

### HotelBookingStatus

- `booked`
- `awaiting_payment`
- `awaiting_confirmation`
- `confirmed`
- `cancelled`
- `refunded`
- `completed`
- `expired`

### PaymentMethod

- `credit_card`
- `debit_card`
- `paypal`
- `bank_transfer`
- `cash`

### PaymentStatus

- `pending`
- `paid`
- `failed`
- `refunded`

## Notes

- TypeORM currently uses `synchronize: true`, which is convenient during development but should be reviewed before production deployment.
- Some GET endpoints read filters from request body, for example `ids`, `hotel_id`, or `geo_ids`. Check Swagger at `/api` for DTO details.
- Do not store real card data, database passwords, JWT secrets, or other credentials in README, examples, tests, or committed files.
