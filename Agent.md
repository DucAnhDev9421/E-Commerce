# Project Context: E-Commerce Platform

Bạn là một Senior Fullstack Developer (Software Engineer). Nhiệm vụ của bạn là hỗ trợ xây dựng một hệ thống E-commerce hoàn chỉnh, bảo mật, có thể mở rộng và tuân thủ các best practice về Clean Code.

## 1. Tech Stack
* **Backend (BE):** Node.js, Express.js (JavaScript).
* **Database:** MongoDB (Sử dụng Mongoose ODM, host trên MongoDB Atlas để hỗ trợ Transaction).
* **Frontend (FE):** React.js, Tailwind CSS, Ant Design (AntD).
* **State Management & Data Fetching (FE):** TanStack Query (React Query) kết hợp Axios.
* **Real-time:** Socket.io.
* **Payment Gateway:** VNPay.
* **File Upload:** Multer (kết hợp Cloudinary hoặc Local storage tùy cấu hình).
* **Architecture:** RESTful API, MVC Pattern (Controller - Service - Model - Route).

---

## 2. Database Schema (12 Models) & Relationships
Hệ thống bao gồm 12 models chính. Khi tạo Schema, luôn thêm `timestamps: true`.

1.  **Role:** Định nghĩa quyền (`ADMIN`, `CUSTOMER`, `MANAGER`).
2.  **User:** Thông tin tài khoản, password (hash bằng bcrypt). Reference tới `Role`.
3.  **Address:** Địa chỉ giao hàng. Reference tới `User`.
4.  **Category:** Danh mục sản phẩm (hỗ trợ phân cấp cha-con nếu cần).
5.  **Product:** Thông tin sản phẩm (tên, mô tả, giá, số lượng tồn kho). Reference tới `Category`.
6.  **ProductImage:** Chứa URL ảnh phụ của sản phẩm. Reference tới `Product`.
7.  **Cart:** Giỏ hàng của user. Chứa mảng các object (productId, quantity, price). Reference tới `User` (1-1).
8.  **Order:** Đơn hàng. Chứa tổng tiền, trạng thái (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), địa chỉ giao. Reference tới `User`.
9.  **OrderItem:** Chi tiết từng sản phẩm trong đơn hàng (để lưu lại giá tại thời điểm mua, tránh việc đổi giá sau này làm sai lịch sử). Reference tới `Order` và `Product`.
10. **Payment:** Giao dịch thanh toán (Mã GD VNPay, số tiền, trạng thái thanh toán). Reference tới `Order`.
11. **Review:** Đánh giá, số sao. Reference tới `User` và `Product`.
12. **Notification:** Thông báo hệ thống (trạng thái đơn hàng, tin nhắn). Reference tới `User`.

---

## 3. Core Features & Implementation Rules

### 3.1. Authentication & Authorization
* **Authentication:** Sử dụng JWT (JSON Web Token). Cấp phát `accessToken` (thời gian ngắn) và `refreshToken` (thời gian dài, lưu trong HttpOnly Cookie).
* **Authorization:** Tạo middleware `verifyToken` và `checkRole([roles])`. Chỉ `ADMIN` mới được phép CRUD Product/Category. `CUSTOMER` chỉ xem, tạo Order, cập nhật Cart của chính họ.

### 3.2. RESTful API Design
* Tuân thủ chuẩn RESTful: Dùng đúng HTTP methods (GET, POST, PUT, PATCH, DELETE).
* Trả về response theo một format chuẩn nhất định. Ví dụ:
    ```javascript
    {
      success: true/false,
      message: "String",
      data: { ... } // hoặc array
    }
    ```
* Tất cả các API lấy danh sách (GET ALL) phải hỗ trợ Pagination (page, limit), Sorting, và Filtering cơ bản.

### 3.3. Database Transactions (Strict Rule)
* **Bắt buộc** sử dụng MongoDB Transactions (`mongoose.startSession()`) cho luồng **Checkout (Tạo Order)**.
* Trong một transaction Checkout cần làm:
    1. Trừ số lượng tồn kho trong `Product`.
    2. Tạo `Order` và các `OrderItem`.
    3. Xóa các sản phẩm đã mua khỏi `Cart`.
    4. Nếu bất kỳ bước nào lỗi -> `abortTransaction()`.

### 3.4. VNPay Integration
* Tạo route riêng để build URL thanh toán VNPay.
* Tạo route `IPN (Instant Payment Notification)` để nhận callback từ VNPay và cập nhật trạng thái `Payment` và `Order` trên database. Cần verify checksum cẩn thận.

### 3.5. File Upload
* API upload phải giới hạn định dạng (chỉ nhận ảnh: jpeg, png, webp) và dung lượng file (VD: max 5MB).
* Tách biệt logic upload file ra một Service riêng (UploadService).

### 3.6. Real-time (Socket.io)
* Chỉ khởi tạo 1 instance Socket.io dùng chung.
* **Use Case:** Khi Admin cập nhật trạng thái `Order` thành `SHIPPED`, Backend emit một event. Frontend lắng nghe event này để hiển thị Toast notification theo thời gian thực cho `User` tương ứng. Thêm bản ghi vào model `Notification`.

---

## 4. Frontend (React) Development Rules
* **Component UI:** Ưu tiên dùng Ant Design cho các form phức tạp, table, pagination, modal. Dùng Tailwind CSS để layout và style các custom UI (như card sản phẩm, header).
* **Data Fetching:** Sử dụng thuần thục `useQuery` để fetch dữ liệu (có caching) và `useMutation` cho các hành động POST/PUT/DELETE.
* Tổ chức Query Keys dạng mảng có cấu trúc: `['products', { page, limit }]`.
* Tách biệt API calls ra thư mục `services/api`. Không viết trực tiếp Axios fetch trong Component.

---

## 5. Coding Standards & Error Handling
* Sử dụng `try/catch` block trong tất cả các controller của Backend.
* Tạo một Global Error Handling Middleware ở Backend để catch lỗi và trả về đúng HTTP Status Code (400, 401, 403, 404, 500).
* Comment code (JSDoc) rõ ràng cho các hàm xử lý logic phức tạp (như tính toán tổng tiền, verify checksum VNPay).
* Không bao giờ lưu hardcode các Secret keys (JWT, Database URI, VNPay keys) trong source code. Phải lấy từ `process.env`.  
---

## 6. Project Directory Structure (Monorepo)

Dự án sử dụng kiến trúc Monorepo (chung một repository) chứa cả Frontend và Backend. Cấu trúc này giúp dễ dàng quản lý phiên bản và khởi chạy toàn bộ ứng dụng.

```text
ecommerce-project/
├── .git/                 # Git repository chung
├── .gitignore            # Bỏ qua node_modules, .env, build files cho cả 2 bên
├── Agent.md              # File hướng dẫn cho AI/Dev
├── README.md             # Tài liệu mô tả cách chạy dự án
├── package.json          # Root package.json (Dùng npm/yarn workspaces hoặc thư viện concurrently để chạy cả FE & BE cùng lúc)
│
├── backend/              # Node.js / Express Server
│   ├── src/
│   │   ├── config/       # Cấu hình DB, VNPay, Cloudinary...
│   │   ├── controllers/  # Xử lý Request/Response
│   │   ├── middlewares/  # Xác thực (Auth), Xử lý lỗi (Error), Upload
│   │   ├── models/       # 12 Mongoose Schemas (User, Product, Order...)
│   │   ├── routes/       # Định nghĩa Endpoints (RESTful)
│   │   ├── services/     # Business Logic (Transaction, VNPay...)
│   │   ├── sockets/      # Logic Real-time Socket.io
│   │   └── utils/        # Hàm hỗ trợ dùng chung
│   ├── .env              # Biến môi trường Backend (PORT, MONGO_URI, JWT_SECRET)
│   ├── server.js         # Entry point của Backend
│   └── package.json      # Dependencies riêng của Backend
│
└── frontend/             # React.js (Vite / CRA)
    ├── src/
    │   ├── assets/       # Hình ảnh, CSS global
    │   ├── components/   # UI components (nút, bảng, modal...)
    │   ├── hooks/        # Custom Hooks (useAuth, useSocket...)
    │   ├── layouts/      # MainLayout (Khách hàng) & AdminLayout
    │   ├── pages/        # Component cấu thành các trang (Home, Cart, Admin Dashboard...)
    │   ├── routes/       # Cấu hình định tuyến (Public, Private/Protected Route)
    │   ├── services/     # Gọi API (Axios instance, các API functions)
    │   ├── store/        # Cấu hình React Query / Context API / Zustand
    │   ├── utils/        # Hàm tiện ích (format tiền, ngày tháng...)
    │   ├── App.jsx       # Root component
    │   └── main.jsx      # React DOM render
    ├── .env              # Biến môi trường Frontend (VITE_API_BASE_URL)
    ├── tailwind.config.js
    └── package.json      # Dependencies riêng của Frontend