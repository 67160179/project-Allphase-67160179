require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Library API พร้อมใช้งาน" });
});

// GET /api/v1/books
// ดึงหนังสือทั้งหมด พร้อมชื่อผู้แต่ง (JOIN กับ authors) -> ยืนยันว่าความสัมพันธ์ books-authors ใช้งานได้จริง
app.get("/api/v1/books", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.book_id, b.title, b.isbn, b.published_year, b.total_copies,
              a.author_id, a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.author_id
       ORDER BY b.book_id`
    );
    res.status(200).json({ message: "สำเร็จ", data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/books/:id
// ดึงหนังสือทีละเล่ม พร้อมหมวดหมู่ทั้งหมด (JOIN ผ่านตารางเชื่อม book_categories) -> ยืนยันความสัมพันธ์ many-to-many
app.get("/api/v1/books/:id", async (req, res, next) => {
  try {
    const [bookRows] = await pool.query(
      `SELECT b.book_id, b.title, b.isbn, b.published_year, b.total_copies,
              a.author_id, a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.author_id
       WHERE b.book_id = ?`,
      [req.params.id]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "ไม่พบข้อมูลหนังสือ" },
      });
    }

    const [categoryRows] = await pool.query(
      `SELECT c.category_id, c.name
       FROM categories c
       JOIN book_categories bc ON c.category_id = bc.category_id
       WHERE bc.book_id = ?`,
      [req.params.id]
    );

    res.status(200).json({
      message: "สำเร็จ",
      data: { ...bookRows[0], categories: categoryRows },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/loans
// สมาชิกยืมหนังสือ -> บันทึกลงตาราง loans จริง
app.post("/api/v1/loans", async (req, res, next) => {
  const { book_id, member_id, loan_date, due_date } = req.body;

  if (!book_id || !member_id || !loan_date || !due_date) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "กรุณาระบุข้อมูลให้ครบถ้วน" },
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO loans (book_id, member_id, loan_date, due_date) VALUES (?, ?, ?, ?)",
      [book_id, member_id, loan_date, due_date]
    );
    res.status(201).json({
      message: "ยืมหนังสือสำเร็จ",
      data: { loan_id: result.insertId, book_id, member_id, loan_date, due_date },
    });
  } catch (err) {
    next(err);
  }
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดในระบบ" },
  });
});

app.listen(PORT, () => {
  console.log(`Server กำลังทำงานที่ http://localhost:${PORT}`);
});