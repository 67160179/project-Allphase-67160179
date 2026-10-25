const request = require("supertest");
const app = require("../src/index");

// เพิ่ม { virtual: true }
jest.mock("../src/db", () => ({
  query: jest.fn(),
}), { virtual: true });

describe("Library API Endpoints Test Suite", () => {
  let pool;

  beforeEach(() => {
    pool = require("../src/db");
    jest.clearAllMocks();
  });

  test("GET /api/v1/health - ควรส่งค่า status OK 200", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  test("GET /api/v1/books - ควรส่งรายการหนังสือทั้งหมด 200", async () => {
    pool.query.mockResolvedValueOnce([
      [
        {
          book_id: 1,
          title: "Clean Code",
          isbn: "9780132350884",
          published_year: 2008,
          total_copies: 5,
          author_id: 1,
          author_name: "Robert C. Martin",
        },
      ],
    ]);

    const res = await request(app).get("/api/v1/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("Clean Code");
  });

  test("GET /api/v1/books/:id - เมื่อไม่พบหนังสือควรส่ง 404 NOT_FOUND", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/v1/books/999");
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("POST /api/v1/loans - ข้อมูลไม่ครบควรส่ง 400 VALIDATION_ERROR", async () => {
    const res = await request(app).post("/api/v1/loans").send({
      book_id: 1,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/v1/loans - ข้อมูลครบถ้วนควรส่ง 201 สำเร็จ", async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 10 }]);

    const res = await request(app).post("/api/v1/loans").send({
      book_id: 1,
      member_id: 1,
      loan_date: "2026-10-25",
      due_date: "2026-11-08",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.loan_id).toBe(10);
  });
});