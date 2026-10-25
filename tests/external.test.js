const axios = require("axios");
const { fetchWithResilience } = require("../src/services/external-api");

jest.mock("axios");

describe("External API Resilience Test Suite", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("ควร Retry อย่างน้อย 2 ครั้งและเรียก Fallback เมื่อบริการภายนอกล้มเหลว", async () => {
    axios.mockRejectedValue(new Error("Network Error"));

    const fallbackData = { title: "Default Fallback Book" };
    const result = await fetchWithResilience(
      "https://openlibrary.org/api/books",
      { fallbackData, timeout: 500 },
      2,
      10
    );

    // พยายามทั้งหมด 3 ครั้ง (รอบแรก + Retry 2 ครั้ง)
    expect(result.attempts).toBe(3);
    expect(result.success).toBe(false);
    expect(result.source).toBe("fallback");
    expect(result.data.title).toBe("Default Fallback Book");
  });

  test("ควรทำงานสำเร็จในรอบแรกหากไม่มี error", async () => {
    axios.mockResolvedValueOnce({ data: { title: "Remote Book" } });

    const result = await fetchWithResilience("https://openlibrary.org/api/books", {}, 2, 10);
    expect(result.attempts).toBe(1);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe("Remote Book");
  });
});