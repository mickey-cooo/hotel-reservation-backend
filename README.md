# Hotel Reservation System Backend

เอกสารนี้สรุปการทำงานของ service หลักใน backend ระบบจองโรงแรม โดยไม่ระบุค่า credential, secret, environment variable หรือข้อมูลสำหรับเชื่อมต่อระบบจริง

## ภาพรวมระบบ

Backend นี้เป็น API สำหรับระบบจองโรงแรม แบ่งการทำงานออกเป็น service ตาม domain หลัก ได้แก่ user, role, hotel, room, address, review, booking และ payment

ระบบใช้แนวคิดหลักดังนี้:

- User สามารถสมัครสมาชิกและ login เพื่อรับ JWT token
- Hotel เก็บข้อมูลโรงแรม ที่อยู่ และรายการห้องพัก
- Hotel Room เก็บข้อมูลห้องพัก ราคา ความจุ สถานะ และสิ่งอำนวยความสะดวก
- Booking ผูก user, hotel และ room เข้าด้วยกันเพื่อสร้างรายการจอง
- Review ให้ user เขียนรีวิวโรงแรม และรองรับการตอบกลับรีวิว
- Payment เก็บข้อมูลวิธีชำระเงินที่ผูกกับ user
- Address ใช้จัดการที่อยู่และข้อมูลพื้นที่ เช่น geography, province และ district

## Service การทำงาน

### User Service

User Service รับผิดชอบการจัดการบัญชีผู้ใช้และ authentication

การทำงานหลัก:

- สมัครสมาชิกด้วย email, password และ confirm password
- ตรวจสอบ email ซ้ำก่อนสร้าง user ใหม่
- เข้ารหัส password ด้วย bcrypt ก่อนบันทึก
- Login ด้วย email และ password
- ตรวจสอบ password แล้วสร้าง JWT access token
- ดึงข้อมูล user รายเดียวหรือหลายรายการ
- แก้ไขข้อมูล user พร้อม address
- ลบ user แบบ soft delete โดยเปลี่ยน status เป็น `deleted`

Flow สำคัญ:

1. Register รับ email/password
2. Service ตรวจ email ซ้ำและตรวจ password confirmation
3. Password ถูก hash ก่อนบันทึก
4. Login ตรวจ credentials
5. ถ้าถูกต้อง ระบบออก JWT token ให้ client ใช้เรียก protected APIs

### Role Service

Role Service ใช้จัดการ role ของ user และลำดับความสำคัญของ role

การทำงานหลัก:

- สร้าง role
- ดึง role รายเดียว
- ดึง role หลายรายการตาม id
- แก้ไขชื่อ, description และ priority
- ลบ role

ข้อมูล role ถูกนำไปใช้กับ User Service ตอน login เพื่อใส่ข้อมูล role ลงใน JWT payload

### Hotel Service

Hotel Service รับผิดชอบข้อมูลโรงแรม รวมถึง address และ room ที่เกี่ยวข้องกับโรงแรม

การทำงานหลัก:

- สร้างโรงแรมใหม่
- บันทึกข้อมูลพื้นฐาน เช่น name, description, image, phoneNumber, email และ website
- สร้างหรือผูก address ของโรงแรม
- สร้างรายการห้องพักของโรงแรมพร้อมกันได้
- ดึงข้อมูลโรงแรมรายเดียว
- ดึงโรงแรมหลายรายการตาม id
- แก้ไขข้อมูลโรงแรม, address และ room ที่เกี่ยวข้อง
- ลบโรงแรม

Flow สำคัญ:

1. Client ส่งข้อมูล hotel พร้อม addressDetail และ rooms
2. Service สร้าง address
3. Service สร้าง hotel และผูก address
4. Service สร้าง rooms แล้วผูกกับ hotel

### Hotel Room Service

Hotel Room Service จัดการข้อมูลห้องพักของโรงแรม

การทำงานหลัก:

- สร้างห้องพักหลายรายการใน request เดียว
- ดึงข้อมูลห้องพักรายเดียว
- ดึงห้องพักหลายรายการตาม id
- แก้ไขชื่อ, description, image, price, capacity, policies, amenities และ room type
- ลบห้องพัก
- ตรวจสอบ availability ของห้องพัก

ข้อมูลสำคัญของห้องพัก:

- `price` ราคาห้อง
- `capacity` จำนวนผู้เข้าพักสูงสุด
- `status` เช่น available, unavailable, maintenance
- `type` เช่น single, double, king, queen, suite
- `amenities` เช่น wifi, tv, minibar, safe
- `policies` เช่น pets, children, smoking, adults

### Address Service

Address Service ใช้จัดการข้อมูลที่อยู่และข้อมูลพื้นที่

การทำงานหลัก:

- สร้าง address
- ดึง address รายเดียว
- ดึง address หลายรายการตาม id
- แก้ไข address
- ลบ address
- ดึง geography หลายรายการ
- ดึง province รายเดียว
- ดึง district จาก geography และ province

Address ถูกใช้ร่วมกับหลาย domain เช่น user และ hotel

### Hotel Review Service

Hotel Review Service จัดการรีวิวโรงแรมและการตอบกลับรีวิว

การทำงานหลัก:

- สร้าง review ให้โรงแรม
- ระบุ title, description, rating และ anonymous flag
- จำกัด rating อยู่ในช่วง 1 ถึง 5
- ดึง review ทั้งหมดของโรงแรม
- ดึง review รายเดียวจาก review id และ hotel id
- แก้ไข review
- ลบ review
- ตอบกลับ review

Flow สำคัญ:

1. User ที่ login แล้วสร้าง review ให้ hotel
2. Service ผูก review กับ user และ hotel
3. User สามารถเลือกให้ review เป็น anonymous ได้
4. ระบบรองรับ reply ของ review ผ่านข้อมูล hotel id และ review id

### Hotel Booking Service

Hotel Booking Service รับผิดชอบการจองห้องพัก

การทำงานหลัก:

- สร้าง booking จาก hotel, room และ user ที่ login อยู่
- รับข้อมูลจำนวนแขก, ระยะเวลาพัก, payment method, check-in และ check-out
- ดึงรายการ booking ของ user
- ดึง booking รายเดียว
- แก้ไขข้อมูล booking
- ยกเลิก booking

Flow สำคัญ:

1. User เลือก hotel และ room
2. Client ส่งข้อมูลการเข้าพัก เช่น guestCount, stayPeriod, checkInDate และ checkOutDate
3. Service สร้าง booking โดยผูกกับ user จาก token
4. เมื่อยกเลิก booking ระบบเปลี่ยนสถานะเป็น cancelled

สถานะ booking ที่ระบบรองรับ:

- `booked`
- `awaiting_payment`
- `awaiting_confirmation`
- `confirmed`
- `cancelled`
- `refunded`
- `completed`
- `expired`

### Payment Service

Payment Service จัดการข้อมูลวิธีชำระเงินของ user

การทำงานหลัก:

- สร้าง payment method ให้ user ที่ login อยู่
- ดึงรายการ payment method
- ดึง payment method รายเดียว
- แก้ไข payment method
- ลบ payment method

ข้อมูล payment ที่ service รองรับ:

- card number
- card holder name
- card expiry month
- card expiry year
- card CVV

หมายเหตุ: เอกสารนี้ไม่ใส่ตัวอย่างเลขบัตรหรือข้อมูลชำระเงินจริง และไม่ควรเก็บข้อมูลบัตรจริงใน repository หรือเอกสาร

## ความสัมพันธ์ของข้อมูลหลัก

- User มี Role ได้หนึ่ง role
- User มี Address ได้หนึ่งรายการ
- User มี Booking ได้หลายรายการ
- User มี Review ได้หลายรายการ
- User มี Payment ได้หลายรายการ
- Hotel มี Address ได้หนึ่งรายการ
- Hotel มี Room ได้หลายรายการ
- Hotel มี Review ได้หลายรายการ
- Hotel มี Booking ได้หลายรายการ
- Room อยู่ภายใต้ Hotel
- Booking ผูก User, Hotel และ Room
- Review ผูก User และ Hotel
- Payment ผูก User

## Authentication

Service ที่ต้องใช้ token จะอ่าน user จาก JWT payload ผ่าน guard และ custom token decorator

Service ที่เป็น protected domain:

- User APIs บางส่วน เช่น create, list, update, delete
- Hotel Review Service
- Hotel Booking Service
- Payment Service

Service ที่เปิดให้เรียกโดยไม่ใช้ token ตาม controller ปัจจุบัน:

- Register/Login
- Role Service
- Hotel Service
- Hotel Room Service
- Address Service

## หมายเหตุการใช้งาน

- หลาย service ใช้ soft delete โดยเปลี่ยน status แทนการลบข้อมูลจริง
- บาง list API รับรายการ id หรือ filter ผ่าน request body แม้จะเป็น HTTP GET
- Swagger ในโปรเจกต์สามารถใช้ดู DTO และ request schema เพิ่มเติมได้
- เอกสารนี้ตั้งใจอธิบาย behavior ของ service เท่านั้น จึงไม่รวม credential, secret, environment variable หรือค่าตั้งค่าระบบจริง
