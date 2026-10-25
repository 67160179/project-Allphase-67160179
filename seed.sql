USE library_db;

INSERT INTO authors (name, nationality) VALUES
  ('ทมยันตี', 'ไทย'),
  ('Haruki Murakami', 'ญี่ปุ่น'),
  ('J.K. Rowling', 'อังกฤษ');

INSERT INTO categories (name) VALUES
  ('นิยาย'),
  ('วิทยาศาสตร์'),
  ('การ์ตูน');

INSERT INTO books (title, isbn, published_year, total_copies, author_id) VALUES
  ('คู่กรรม', '9789740000011', 1985, 3, 1),
  ('Norwegian Wood', '9789740000028', 1987, 2, 2),
  ('Harry Potter and the Philosopher''s Stone', '9789740000035', 1997, 4, 3);

-- หนังสือ 1 เล่มมีได้หลายหมวดหมู่ (many-to-many)
INSERT INTO book_categories (book_id, category_id) VALUES
  (1, 1),
  (2, 1),
  (2, 2),
  (3, 1),
  (3, 3);

INSERT INTO members (name, email, phone) VALUES
  ('สมชาย ใจดี', 'somchai@example.com', '0812345678'),
  ('สมหญิง รักเรียน', 'somying@example.com', '0898765432'),
  ('วิชัย ตั้งใจ', 'wichai@example.com', '0866554433');

INSERT INTO loans (book_id, member_id, loan_date, due_date, return_date) VALUES
  (1, 1, '2026-08-01', '2026-08-15', '2026-08-10'),
  (2, 2, '2026-08-05', '2026-08-19', NULL),
  (3, 3, '2026-08-10', '2026-08-24', NULL);