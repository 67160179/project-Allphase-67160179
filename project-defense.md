# Project Defense — สคริปต์นำเสนอ 5–7 นาที

## Demo สด (3–4 นาที)

1. เปิด `http://localhost:3000` หลังเริ่ม Node server และ MySQL
2. อธิบาย Dashboard จำนวนหนังสือและรายการยืม; แสดง GET `/api/v1/books`, GET `/api/v1/loans`
3. กด "ตรวจสอบพร้อมยืม" เพื่อสาธิต GET `/api/v1/books/:id/availability`
4. เลือกหนังสือ สมาชิก วันที่ยืม และกำหนดคืน; กดบันทึกการยืมเพื่อสาธิต POST `/api/v1/loans`
5. แสดงรายการใหม่แล้วกด "บันทึกคืน" เพื่อสาธิต PATCH `/api/v1/loans/:id/return`
6. ใส่ due date ก่อน loan date เพื่อสาธิต frontend validation; เปิด `/api-docs` แสดง Swagger

> ตรวจสอบก่อน demo ว่ามี MySQL schema, สมาชิกตัวอย่าง และข้อมูลหนังสือ และ endpoint ใช้งานได้จริง

## อธิบายโครงสร้าง + Q&A (2–3 นาที)

- **Week 13 architecture:** เปิด `microservices-design.md` อธิบาย Gateway → Catalog/Member/Loan/Enrichment; เป็นการออกแบบเป้าหมาย ไม่ใช่การ deploy แยก process ใน Phase 3
- **ป้องกันยืมเกิน:** POST loan ใช้ transaction และล็อกแถวหนังสือก่อนตรวจจำนวนรายการยืมค้าง; ต้องทดสอบสดกับ MySQL ก่อนแสดงจริง

- **Frontend:** HTML/CSS/JavaScript ใช้ `fetch` เรียก API ที่มีอยู่ ไม่ใช่ข้อมูลจำลองบนหน้าเว็บ
- **Backend:** Express จัดการ endpoint; Service modules แยก validation และคำนวณ availability ออกจาก route
- **DB:** MySQL เก็บ books, authors, categories, members และ loans; ใช้ placeholder `?` ในคำสั่ง query
- **External API:** Open Library มี retries/timeout/fallback ตาม Phase 2; หากเรียกไม่ได้ใช้ข้อมูลสำรอง
- **ทำไมเลือก plain JavaScript:** เล็ก เริ่มได้ทันที และเหมาะกับข้อกำหนด frontend ขนาดเล็ก
- **ปัญหาเดิม:** ZIP ขาด `db.js`, schema และ Week 13 deployed service code; เราสร้าง Week 13 design ตามข้อ 3.2 และเพิ่ม service modules ไว้ใน Monolith แต่ไม่ได้อ้างว่ามี Microservices deploy จริง
- **Test:** service unit tests ผ่าน; ยังไม่ใช่ full integration/whole-system coverage จึงรายงานข้อจำกัดไว้ชัดเจน
