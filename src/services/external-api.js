const axios = require("axios");

/**
 * เรียก External API พร้อมกลไก Retry, Timeout และ Fallback
 * @param {string} url - Target URL ของ External API
 * @param {object} options - Axios request options
 * @param {number} retries - จำนวนครั้งที่ต้องการ Retry (ค่าเริ่มต้น 2 ครั้ง)
 * @param {number} delay - ระยะเวลาหน่วงระหว่างการ Retry (ms)
 */
async function fetchWithResilience(url, options = {}, retries = 2, delay = 1000) {
  const timeoutMs = options.timeout || 3000; // กำหนด timeout สูงสุด 3 วินาที

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios({
        url,
        method: options.method || "GET",
        timeout: timeoutMs,
        ...options,
      });

      return {
        success: true,
        source: "external-api",
        attempts: attempt,
        data: response.data,
      };
    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED";
      const isServerError = error.response && error.response.status >= 500;
      const isNetworkError = !error.response;
      const isLastAttempt = attempt === retries + 1;

      console.warn(
        `[External API] พยายามครั้งที่ ${attempt} ล้มเหลว (${error.message}). จะลองใหม่หรือไม่: ${
          !isLastAttempt && (isTimeout || isServerError || isNetworkError)
        }`
      );

      // เงื่อนไขในการยุติและใช้ Fallback: พยายามครบโควตา หรือเป็น Client Error (4xx)
      if (isLastAttempt || (!isTimeout && !isServerError && !isNetworkError)) {
        return {
          success: false,
          source: "fallback",
          attempts: attempt,
          error: error.message,
          data: options.fallbackData || {
            title: "ไม่สามารถดึงข้อมูลจากเครือข่ายภายนอกได้ในขณะนี้",
            description: "ระบบเปิดใช้งานโหมดสำรองข้อมูลอัตโนมัติ (Fallback Mode)",
            cached: false,
          },
        };
      }

      // Exponential/Incremental Delay ก่อนลองใหม่
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

/**
 * ฟังก์ชันดึงรายละเอียดเพิ่มเติมของหนังสือจาก Open Library ผ่าน ISBN
 */
async function fetchBookMetadataByISBN(isbn) {
  // หากต้องการจำลองข้อผิดพลาดในการทดสอบ สามารถกำหนด URL ปลายทางผ่าน ENV ได้
  const baseUrl = process.env.EXTERNAL_BOOK_API_URL || "https://openlibrary.org/api/books";
  const url = `${baseUrl}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  const fallbackData = {
    isbn,
    title: "ข้อมูลพื้นฐานจากคลังระบบภายใน",
    publish_date: "ไม่ระบุ",
    number_of_pages: null,
    notes: "External service offline or unreachable, default metadata used",
  };

  return await fetchWithResilience(url, { method: "GET", fallbackData, timeout: 3000 }, 2, 1000);
}

module.exports = {
  fetchWithResilience,
  fetchBookMetadataByISBN,
};