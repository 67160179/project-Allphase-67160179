# รายงานผลการทดสอบ Test Coverage Baseline

- **รหัสนิสิต:** 67160179
- **โครงงาน:** ระบบจัดการห้องสมุด (Library Management System Phase 3)
- **เครื่องมือที่ใช้:** Jest 29.7.0, Supertest 7.0.0

---

## 1. สรุปผลการทดสอบภาพรวม (Coverage Summary)

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
|---|---|---|---|---|---|
| **src/index.js** | 88.5% | 75.0% | 85.7% | 88.5% | บรรทัดที่ 46 (Swagger load fail), บรรทัดที่ 195 (Catch fallback) |
| **src/services/external-api.js** | 92.8% | 83.3% | 100% | 92.8% | บรรทัดที่ 54 (กรณี URL เป็นค่า default) |
| **All Files รวม** | **90.2%** | **78.5%** | **91.6%** | **90.2%** | - |

---

## 2. รายละเอียดการทดสอบแต่ละโมดูล

1. **Unit & Integration API Endpoints (`tests/api.test.js`):**
   - ทดสอบ Health Check (`GET /api/v1/health`)
   - ทดสอบการดึงรายการหนังสือทั้งหมด (`GET /api/v1/books`)
   - ทดสอบกรณีค้นหาไม่พบ (`404 NOT_FOUND`)
   - ทดสอบการตรวจสอบความถูกต้องของข้อมูลการยืม (`400 VALIDATION_ERROR`)
   - ทดสอบการบันทึกการยืมสำเร็จ (`201 CREATED`)
2. **Resilience & Integration (`tests/external.test.js`):**
   - ทดสอบ Happy Path (ดึงข้อมูลสำเร็จใน attempt ที่ 1)
   - ทดสอบ Retry Logic (วนซ้ำครบ 2 ครั้งเมื่อเกิด Network Error)
   - ทดสอบ Timeout & Fallback (สลับมาใช้ Fallback Object เมื่อครบโควตา)

## 3. จุดที่ยังไม่มี Test ครอบคลุม (Uncovered Areas)
- บรรทัดการเปิด Port `app.listen()` ใน `src/index.js` เนื่องจากถูกยกเว้นในระหว่างรันเทส (`NODE_ENV === 'test'`) เพื่อป้องกันปัญหาพอร์ตชนกัน
- การเชื่อมต่อจริงกับฐานข้อมูล MySQL ในไฟล์ `src/db.js` (ทำการ Mock ฟังก์ชัน `pool.query` เพื่อความเสถียรของการทดสอบ)