# AI Interactive Course Engine

Biến mọi cuốn giáo trình (PDF) thành một khóa học tương tác (chia đôi màn hình, vừa đọc lý thuyết vừa thực hành) hoàn toàn tự động nhờ sức mạnh của AI.

## 🌟 Cấu trúc dự án
- **Backend**: Spring Boot 3, Java 21, Spring Data JPA, Apache PDFBox.
- **Frontend**: ReactJS, Vite, Tailwind CSS v4, Framer Motion, Canvas Confetti.
- **Database**: MySQL 8.0 (qua Docker Compose).
- **Core AI**: Google Gemini 1.5 Pro API (Tạo dữ liệu Polymorphic JSON).

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (End-to-End)

### Bước 1: Khởi động Database (MySQL)
Mở terminal tại thư mục gốc của dự án (`/ai-interactive-course-engine`) và chạy lệnh:
```bash
docker-compose up -d
```
*Lưu ý: Lệnh này sẽ dựng MySQL ở port 3306 và phpMyAdmin ở port 8080.*

### Bước 2: Cấu hình Gemini API Key cho Backend
Có 2 cách để nạp key Gemini vào Backend:

**Cách 1 (Nhanh nhất để test):** Dán trực tiếp vào file `application.yml`.
Mở file `backend/src/main/resources/application.yml` và sửa dòng:
\`\`\`yaml
gemini:
  api:
    key: ĐIỀN_KEY_CỦA_BẠN_VÀO_ĐÂY_SAU_DẤU_HAI_CHẤM
\`\`\`
*(Nhớ xóa đoạn `${GEMINI_API_KEY:}` đi nhé).*

**Cách 2 (An toàn bảo mật):** Dùng biến môi trường (Environment Variable). Giữ nguyên file `.yml` và chạy lệnh sau ở terminal:
\`\`\`bash
export GEMINI_API_KEY="AIzaSy..."
\`\`\`

### Bước 3: Chạy Backend (Spring Boot)
Di chuyển vào thư mục backend và chạy ứng dụng:
```bash
cd backend
./mvnw spring-boot:run
```
*Backend sẽ chạy ở cổng `http://localhost:8080`.*

### Bước 4: Chạy Frontend (React)
Mở một cửa sổ terminal mới, di chuyển vào thư mục frontend và chạy:
```bash
cd frontend
npm run dev
```
*Frontend sẽ chạy ở cổng `http://localhost:5173`.*

Mở trình duyệt, truy cập `http://localhost:5173`, upload một file PDF và xem AI "làm phép" nhé! 🎉
