/** Catalog helpers shared by API and tests (Week 15 service-layer integration). */
function normalizeSearch(input) { return String(input || '').trim().slice(0, 100); }
function formatAvailability(book, borrowed) {
  const total = Number(book.total_copies);
  const available = Math.max(0, total - Number(borrowed));
  return { book_id: Number(book.book_id), total_copies: total, borrowed_copies: Number(borrowed), available_copies: available };
}
module.exports = {normalizeSearch, formatAvailability};
