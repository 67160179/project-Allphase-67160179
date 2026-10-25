# LibraryDesk — Phase 3 (รหัสนิสิต 67160179)

โปรเจกต์ต่อยอดจาก `project-phase2-67160179-1.zip` เป็น Library Management System ที่มี frontend, Express API, MySQL schema และ service-level tests.

## เริ่มต้นบน Windows / macOS / Linux

1. ติดตั้ง Node.js (18+), MySQL 8+
2. เปิด MySQL แล้วนำ `sql/schema.sql` เข้า MySQL: `mysql -u root -p < sql/schema.sql` (บน PowerShell ใช้ `cmd /c "mysql -u root -p < sql/schema.sql"` หรือ MySQL Workbench เปิด SQL file แล้ว Execute)
3. คัดลอก `.env.example` เป็น `.env` แล้วแก้ DB_USER/DB_PASSWORD ตามเครื่อง; **อย่า commit `.env`**
4. ติดตั้ง dependencies: `npm install`
5. เริ่มโปรเจกต์: `npm start`
6. เปิด `http://localhost:3000` (Frontend), `http://localhost:3000/api-docs` (Swagger), `http://localhost:3000/api/health` (API health)
7. รันทดสอบ: `npm test` และ `npm run coverage`

## What is delivered

- `src/index.js`: REST API; Phase 2 routes plus members listing, loans listing, availability and health
- `src/services/`: preserved external API integration plus new modular catalog and loan validation
- `db.js`, `sql/schema.sql`, `.env.example`: MySQL setup
- `frontend/`: responsive single-page library dashboard, borrow form, return action, loading/errors
- `openapi.yaml`: updated documented endpoints
- `coverage-report.md` and `clo-requirements-checklist.md`: verifiable status and limitations
- `project-defense.md`: live demo and Q&A presentation notes
- `postman_collection.json`, `failure-scenario-results.md`: preserved Phase 2 artifacts
- `microservices-design.md`: original Week 13 design deliverable integrated into Phase 3 (conceptual architecture only)
- `POST /api/v1/loans` now checks member existence and book availability using an InnoDB row lock/transaction (not yet live DB-tested).

## Original materials missing / important limitations

The source ZIP did not include the original Phase 1 files, Week 9/13 test suites or deployed Week 13 Microservices source. Week 13 design has now been authored using the supplied `wk13-lab.md` as a separate submission. Thus this submission is a **Phase 3 completion scaffold built from the available Phase 2 files**, not a verified merge of Week 13. Do not claim the original W13 microservices were integrated. MySQL-backed endpoints and browser interactions require testing on an installed environment; Node unit tests alone cannot prove live behavior. Current DB schema is recreated based on observed SQL queries, not verified against original Phase 1 migration.
