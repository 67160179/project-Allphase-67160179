/** Borrowing business rules, isolated for testing and reuse. */
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function validateLoan({book_id, member_id, loan_date, due_date} = {}) {
  if (!Number.isSafeInteger(Number(book_id)) || Number(book_id) <= 0 || !Number.isSafeInteger(Number(member_id)) || Number(member_id) <= 0) return 'รหัสหนังสือและสมาชิกต้องเป็นจำนวนเต็มบวก';
  if (!validDate(loan_date) || !validDate(due_date)) return 'วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD และเป็นวันที่จริง';
  if (due_date < loan_date) return 'วันกำหนดคืนต้องไม่ก่อนวันยืม';
  return null;
}
function validId(value) { return /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value)); }
module.exports = {validDate, validateLoan, validId};
