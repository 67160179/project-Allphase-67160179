require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const pool = require("./db");
const { fetchBookMetadataByISBN } = require("./services/external-api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

// ให้บริการ Frontend จากโฟลเดอร์ frontend/
app.use(express.static(path.join(__dirname, "../frontend")));

// โหลด Swagger UI ที่ /api-docs
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn("ไม่สามารถโหลดไฟล์ openapi.yaml:", error.message);
}

// 1. Health Check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Library API พร้อมใช้งาน" });
});

// 2. GET /api/v1/books - ดึงรายการหนังสือทั้งหมด
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

// 3. GET /api/v1/books/:id - ดึงหนังสือรายเล่ม
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

// 4. GET /api/v1/books/:id/external-info - ดึงข้อมูลเพิ่มเติมจาก Open Library
app.get("/api/v1/books/:id/external-info", async (req, res, next) => {
  try {
    const [books] = await pool.query("SELECT * FROM books WHERE book_id = ?", [req.params.id]);
    if (books.length === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "ไม่พบข้อมูลหนังสือ" },
      });
    }

    const book = books[0];
    const externalResult = await fetchBookMetadataByISBN(book.isbn);

    res.status(200).json({
      message: "ดึงข้อมูลจากบริการภายนอกสำเร็จ",
      data: {
        book_id: book.book_id,
        title: book.title,
        isbn: book.isbn,
        integration_status: externalResult.success ? "LIVE" : "FALLBACK",
        attempts: externalResult.attempts,
        details: externalResult.data,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/v1/loans - สมาชิกยืมหนังสือ
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

// 6. PATCH /api/v1/loans/:id/return - คืนหนังสือ
app.patch("/api/v1/loans/:id/return", async (req, res, next) => {
  const { return_date } = req.body;
  const returnDate = return_date || new Date().toISOString().split("T")[0];

  try {
    const [result] = await pool.query(
      "UPDATE loans SET return_date = ? WHERE loan_id = ? AND return_date IS NULL",
      [returnDate, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "ไม่พบรายการยืมที่ยังไม่ได้คืน" },
      });
    }

    res.status(200).json({
      message: "บันทึกการคืนหนังสือสำเร็จ",
      data: { loan_id: Number(req.params.id), return_date: returnDate },
    });
  } catch (err) {
    next(err);
  }
});

// 7. GET /api/v1/members/:id/loans - ดูประวัติการยืมของสมาชิก
app.get("/api/v1/members/:id/loans", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.loan_id, l.loan_date, l.due_date, l.return_date,
              b.book_id, b.title AS book_title, b.isbn
       FROM loans l
       JOIN books b ON l.book_id = b.book_id
       WHERE l.member_id = ?
       ORDER BY l.loan_date DESC`,
      [req.params.id]
    );

    res.status(200).json({ message: "สำเร็จ", data: rows });
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดในระบบ" },
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server กำลังทำงานที่ http://localhost:${PORT}`);
    console.log(`หน้าเว็บ Frontend: http://localhost:${PORT}`);
    console.log(`เอกสาร Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;