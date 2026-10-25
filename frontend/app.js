document.addEventListener("DOMContentLoaded", () => {
  const booksList = document.getElementById("books-list");
  const booksLoading = document.getElementById("books-loading");
  const alertBox = document.getElementById("alert-box");
  const loanForm = document.getElementById("loan-form");

  // ฟังก์ชันช่วยจัดรูปแบบวันที่เป็น YYYY-MM-DD ตามเวลาเครื่องท้องถิ่น (Local Timezone)
  const formatLocalDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ฟังก์ชันแปลงค่าวันที่ที่ได้รับจาก API ให้เป็น YYYY-MM-DD ตรงตามเวลาจริง
  const toDisplayDate = (dateVal) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).substring(0, 10);
    return formatLocalDate(d);
  };

  // ตั้งค่าวันที่เริ่มต้นของฟอร์มตามเวลาเครื่องท้องถิ่น
  const now = new Date();
  const next2WeeksDate = new Date();
  next2WeeksDate.setDate(now.getDate() + 14);

  document.getElementById("loan_date").value = formatLocalDate(now);
  document.getElementById("due_date").value = formatLocalDate(next2WeeksDate);

  function showAlert(message, type = "success") {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 5000);
  }

  // 1. GET /api/v1/books: ดึงรายการหนังสือ
  async function loadBooks() {
    booksLoading.classList.remove("hidden");
    booksList.innerHTML = "";
    try {
      const res = await fetch("/api/v1/books");
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการหนังสือได้");
      const result = await res.json();

      if (!result.data || result.data.length === 0) {
        booksList.innerHTML = "<p>ไม่พบรายการหนังสือในระบบ</p>";
        return;
      }

      result.data.forEach((b) => {
        const item = document.createElement("div");
        item.className = "book-item";
        item.innerHTML = `
          <h4>[ID: ${b.book_id}] ${b.title}</h4>
          <p>ผู้แต่ง: ${b.author_name} | ปีที่พิมพ์: ${b.published_year}</p>
          <p>ISBN: ${b.isbn} | จำนวนทั้งหมด: ${b.total_copies} เล่ม</p>
          <button class="btn btn-secondary" style="margin-top:6px; padding:4px 8px; font-size:0.8rem;" 
                  onclick="viewExternalInfo(${b.book_id})">
            ตรวจสอบข้อมูล Open Library
          </button>
        `;
        booksList.appendChild(item);
      });
    } catch (err) {
      showAlert(err.message, "error");
      booksList.innerHTML = `<p style="color:#e53e3e;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>`;
    } finally {
      booksLoading.classList.add("hidden");
    }
  }

  // 2. POST /api/v1/loans: ฟอร์มยืมหนังสือพร้อมการตรวจสอบความถูกต้อง
  loanForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // เคลียร์ Error เดิม
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));

    const book_id = document.getElementById("book_id").value.trim();
    const member_id = document.getElementById("member_id").value.trim();
    const loan_date = document.getElementById("loan_date").value;
    const due_date = document.getElementById("due_date").value;

    let hasError = false;
    if (!book_id) {
      document.getElementById("err-book-id").textContent = "กรุณากรอกรหัสหนังสือ";
      hasError = true;
    }
    if (!member_id) {
      document.getElementById("err-member-id").textContent = "กรุณากรอกรหัสสมาชิก";
      hasError = true;
    }
    if (!loan_date) {
      document.getElementById("err-loan-date").textContent = "กรุณาระบุวันที่ยืม";
      hasError = true;
    }
    if (!due_date) {
      document.getElementById("err-due-date").textContent = "กรุณาระบุกำหนดส่งคืน";
      hasError = true;
    }
    if (loan_date && due_date && due_date < loan_date) {
      document.getElementById("err-due-date").textContent = "กำหนดส่งคืนต้องไม่อยู่ก่อนวันที่ยืม";
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch("/api/v1/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          book_id: parseInt(book_id, 10),
          member_id: parseInt(member_id, 10),
          loan_date: loan_date,
          due_date: due_date,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data?.error?.message || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (Status: ${res.status})`;
        throw new Error(errorMsg);
      }

      showAlert(`ยืมหนังสือสำเร็จ! รหัสรายการยืม (Loan ID): ${data.data.loan_id}`, "success");
      document.getElementById("book_id").value = "";
    } catch (err) {
      showAlert(err.message, "error");
    }
  });

  // 3. PATCH /api/v1/loans/:id/return: คืนหนังสือ
  document.getElementById("btn-return-book").addEventListener("click", async () => {
    const loanId = document.getElementById("return_loan_id").value.trim();
    if (!loanId || Number(loanId) <= 0) {
      showAlert("กรุณาระบุ Loan ID ที่ถูกต้อง", "error");
      return;
    }

    try {
      const res = await fetch(`/api/v1/loans/${loanId}/return`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ return_date: formatLocalDate(new Date()) }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message || "คืนหนังสือไม่สำเร็จ หรือไม่พบรายการยืมนี้");
      }

      showAlert(`บันทึกคืนหนังสือ Loan ID: ${loanId} เรียบร้อยแล้ว`, "success");
      document.getElementById("return_loan_id").value = "";
    } catch (err) {
      showAlert(err.message, "error");
    }
  });

  // 4. GET /api/v1/members/:id/loans: ดูประวัติสมาชิก
  document.getElementById("btn-search-member").addEventListener("click", async () => {
    const memberId = document.getElementById("search_member_id").value.trim();
    const resultDiv = document.getElementById("member-loans-result");
    if (!memberId || Number(memberId) <= 0) {
      showAlert("กรุณาระบุ Member ID ที่ถูกต้อง", "error");
      return;
    }

    resultDiv.innerHTML = "<span>กำลังโหลดประวัติ...</span>";
    try {
      const res = await fetch(`/api/v1/members/${memberId}/loans`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message || "ไม่สามารถดึงข้อมูลได้");

      if (!data.data || data.data.length === 0) {
        resultDiv.innerHTML = "<p style='margin-top:8px;'>ไม่พบประวัติการยืมของสมาชิกนี้</p>";
        return;
      }

      let html = `<ul style='margin-top:10px; padding-left:18px;'>`;
      data.data.forEach((item) => {
        const loanDate = toDisplayDate(item.loan_date) || "-";
        const returnDate = toDisplayDate(item.return_date) || "ยังไม่คืน";

        html += `<li style="margin-bottom: 6px;">
          [Loan ID: ${item.loan_id}] <strong>${item.book_title}</strong> 
          (ยืม: ${loanDate} | คืน: ${returnDate})
        </li>`;
      });
      html += `</ul>`;
      resultDiv.innerHTML = html;
    } catch (err) {
      resultDiv.innerHTML = "";
      showAlert(err.message, "error");
    }
  });

  // Modal External API
  window.viewExternalInfo = async (bookId) => {
    const modal = document.getElementById("modal-external");
    const modalBody = document.getElementById("modal-body");
    modal.classList.remove("hidden");
    modalBody.innerHTML = "กำลังดึงข้อมูลจาก Open Library...";

    try {
      const res = await fetch(`/api/v1/books/${bookId}/external-info`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message || "ไม่สามารถดึงข้อมูลได้");

      modalBody.innerHTML = `
        <p><strong>สถานะเชื่อมต่อ:</strong> <span style="color:${json.data.integration_status === "LIVE" ? "green" : "orange"}">${json.data.integration_status}</span></p>
        <p><strong>Attempts:</strong> ${json.data.attempts}</p>
        <pre style="background:#edf2f7; padding:10px; margin-top:8px; border-radius:4px; max-height:200px; overflow:auto; font-size:0.8rem;">${JSON.stringify(json.data.details, null, 2)}</pre>
      `;
    } catch (err) {
      modalBody.innerHTML = `<p style="color:red">เกิดข้อผิดพลาด: ${err.message}</p>`;
    }
  };

  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-external").classList.add("hidden");
  });

  document.getElementById("btn-refresh-books").addEventListener("click", loadBooks);

  loadBooks();
});