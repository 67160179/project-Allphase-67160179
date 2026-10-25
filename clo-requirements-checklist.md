# Checklist ตรวจสอบครบ CLO Requirements (Phase 3)

- **รหัสนิสิต:** 67160179
- **ชื่อระบบ:** ระบบจัดการห้องสมุด (Library Management System)

---

| CLO ที่วัด | เกณฑ์ข้อกำหนดตาม Course Plan | สถานะ | หลักฐานอ้างอิงในโค้ด/โปรเจกต์ |
|---|---|:---:|---|
| **CLO6 (PLO10)** <br> Client-Facing Frontend | 1. เรียกใช้ API จริงครบตามเกณฑ์ (อย่างน้อย 3 Endpoints ทั้ง GET และ POST/PATCH) | ครบถ้วน | - `frontend/app.js` (บรรทัด 20-56: เรียก `GET /api/v1/books`)<br>- `frontend/app.js` (บรรทัด 60-112: เรียก `POST /api/v1/loans`)<br>- `frontend/app.js` (บรรทัด 116-137: เรียก `PATCH /api/v1/loans/:id/return`) |
| | 2. หน้าจออ่านง่าย มีสถานะ Loading และ Error ชัดเจน ไม่ค้างเงียบ | ครบถ้วน | - `frontend/index.html` (บรรทัด 26-29, 100-108)<br>- `frontend/app.js` (`showAlert()`, จัดการ spinner และกล่องแจ้งเตือน) |
| | 3. แบบฟอร์มรับข้อมูลมีการตรวจสอบความถูกต้องเบื้องต้น (Validation) ฝั่งหน้าบ้าน | ครบถ้วน | - `frontend/app.js` (บรรทัด 70-93: ตรวจสอบค่าว่าง, รหัสหนังสือ, รหัสสมาชิก, วันที่ยืม-คืน) |
| **CLO8 (PLO14)** <br> Final Integration & Resilience | 1. โค้ดรวมสมบูรณ์ ไม่มี conflict หรือ error รันผ่านคำสั่งเดียวได้ | ครบถ้วน | - `package.json` (`npm start` รันทั้ง Express, Static Frontend, Swagger UI)<br>- `src/index.js` รวม Endpoints จาก Phase 1-2 ครบถ้วน |
| | 2. เอกสาร OpenAPI สอดคล้องตรงกับโค้ดจริงทุกประการ (Swagger/Code Match) | ครบถ้วน | - `openapi.yaml` ครอบคลุมทุก route ใน `src/index.js` พร้อมเปิดดูผ่าน `/api-docs` |
| | 3. External API Resilience (Retry >= 2 ครั้ง, Timeout, Fallback) | ครบถ้วน | - `src/services/external-api.js` (บรรทัด 13-58)<br>- บันทึกผลใน `failure-scenario-results.md` |
| | 4. รายงาน Test Coverage Baseline | ครบถ้วน | - ไฟล์ `coverage-report.md` (Coverage รวม > 90%) |
| **CLO7 (PLO13)** <br> Project Defense | นำเสนอผลงานสด (Demo 3-4 นาที, ตอบคำถาม 2-3 นาที) | พร้อม | เตรียมสคริปต์ขั้นตอนสาธิตระบบสด (ดูรายละเอียดในคู่มือการนำเสนอ) |