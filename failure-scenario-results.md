# รายงานผลการทดสอบ Failure Scenario & API Resilience

- **รหัสนิสิต:** 67160179
- **ระบบ:** Library Management System
- **จุดเชื่อมต่อภายนอก (External API):** Open Library Books API (`https://openlibrary.org/api/books`)

---

## 1. การออกแบบกลไกความทนทาน (Resilience Architecture)

1. **Timeout:** ตั้งค่าไว้ที่ `3000ms` (3 วินาที) หากบริการภายนอกไม่ตอบกลับในเวลาที่กำหนด จะถือว่าคำขอนั้นล้มเหลว
2. **Retry Logic:** มีการลองใหม่อัตโนมัติ `2 ครั้ง` (รวมการเรียกครั้งแรกเป็นทั้งหมด 3 ครั้ง) พร้อมหน่วงเวลาแบบ Incremental Backoff (1 วินาที, 2 วินาที) เมื่อเจอปัญหา Network Down, Timeout หรือ 5xx Server Error
3. **Fallback:** หากครบกำหนดการ Retry แล้วยังไม่สำเร็จ ระบบจะไม่ Crash แต่จะส่งคืนข้อมูลพื้นฐานจำลอง (Default Fallback Object) พร้อมแจ้ง `integration_status: "FALLBACK"` กลับไปยัง Client อย่างราบรื่น

---

## 2. สถานการณ์จำลองและผลการทดสอบจริง

### สถานการณ์ที่ 1: การเรียกใช้งานในสภาวะปกติ (Happy Path)
- **การจำลอง:** เรียก Open Library API ด้วยอินเทอร์เน็ตปกติ
- **Endpoint:** `GET /api/v1/books/1/external-info`
- **ผลลัพธ์:**
  - จำนวนครั้งที่เรียก: 1 ครั้ง (สำเร็จทันที)
  - HTTP Status: `200 OK`
  - คีย์ข้อมูล: `integration_status: "LIVE"`, `attempts: 1`
  - ข้อมูล metadata ถูกดึงมาจาก Open Library ครบถ้วน

---

### สถานการณ์ที่ 2: ปลายทางเซิร์ฟเวอร์ภายนอกล่มหรือไม่ตอบสนอง (Timeout Scenario)
- **การจำลอง:** กำหนด `EXTERNAL_BOOK_API_URL=http://10.255.255.1` (Non-routable IP เพื่อให้เกิด Connection Timeout เกิน 3 วินาที)
- **ผลการสังเกตจาก Console Log:**
  ```text
  [External API] พยายามครั้งที่ 1 ล้มเหลว (timeout of 3000ms exceeded). จะลองใหม่หรือไม่: true
  [External API] พยายามครั้งที่ 2 ล้มเหลว (timeout of 3000ms exceeded). จะลองใหม่หรือไม่: true
  [External API] พยายามครั้งที่ 3 ล้มเหลว (timeout of 3000ms exceeded). จะลองใหม่หรือไม่: false