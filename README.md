# To-Do-List Backend

## 1. Các thư viện cần cài đặt

- express
- mongoose
- bcrypt
- cors
- dotenv
- jsonwebtoken
- ngrok

**Dev dependencies:**
- typescript
- ts-node
- @types/node
- @types/express
- @types/bcrypt
- @types/cors
- @types/jsonwebtoken
- @types/mongoose

Cài đặt tất cả bằng lệnh:
```bash
npm install
```

---

## 2. Thiết lập file môi trường `.env`
Tạo file `.env` ở thư mục gốc với nội dung mẫu:
```env
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_CLUSTER=your_cluster_name
DB_APPNAME=your_db_name
JWT_SECRET=your_jwt_secret
PORT=3000
```
- Thay các giá trị bằng thông tin thực tế của bạn.
- `JWT_SECRET` là chuỗi bí mật dùng để ký JWT.
- `PORT` là cổng server (mặc định 3000).

---

## 3. Hướng dẫn cài đặt và sử dụng ngrok

### Bước 1: Tải và cài đặt ngrok
- Truy cập trang chính thức: https://ngrok.com/download
- Tải phiên bản phù hợp với hệ điều hành (Windows/macOS/Linux).
- Giải nén file zip và di chuyển file `ngrok.exe` vào thư mục dễ truy cập, ví dụ: `C:\ngrok`.

### Bước 2: Đăng ký tài khoản và lấy Authtoken
- Truy cập: https://dashboard.ngrok.com/get-started/setup
- Đăng ký/Đăng nhập → chọn mục Your Authtoken bên trái → bạn sẽ thấy Authtoken xuất hiện ở đầu trang.
- Chạy file vừa giải nén ở bước 1.
- Chạy lệnh sau trong cửa sổ vừa mở:
  ```bash
  ngrok config add-authtoken YOUR_AUTHTOKEN
  ```
  Thay `YOUR_AUTHTOKEN` bằng chuỗi bạn nhận được.

### (Tuỳ chọn) Không muốn sử dụng ngrok?
- Nếu không muốn dùng ngrok, bạn có thể mở file `server/server.ts` và comment hoặc xoá đoạn mã liên quan đến ngrok:
  ```typescript
  // import ngrok from 'ngrok';
  // ...
  // const url = await ngrok.connect(Number(PORT));
  // logger.info(`Ngrok đang chạy tại: ${url}`);
  ```
- Sau đó, chỉ cần truy cập trực tiếp qua `http://localhost:3000`.

---

## 4. Cách chạy code

### Cài đặt dependencies
```bash
npm install
```

### Chạy server ở chế độ dev
```bash
npm run dev
```

### Chạy server ở chế độ production
```bash
npm start
```

- Khi chạy thành công, server sẽ kết nối MongoDB và tự động tạo tunnel ngrok (in ra URL trên console).
- Các log sẽ được lưu vào file `server/log/server.log`.

---

## 5. Lưu ý
- Đảm bảo MongoDB đã được cấu hình đúng.
- Không commit file `.env` lên git để bảo mật thông tin.
- Nếu gặp lỗi, kiểm tra log trong `server/log/server.log` để debug.
