# E-Commerce API Documentation

Tài liệu liệt kê danh sách các API Endpoints, phương thức HTTP, và cấu trúc dữ liệu (Request Body) tương ứng.

**Base URL:** `http://localhost:5000/api/v1` (Hoặc theo cấu hình `.env`)

---

## 1. Authentication (`/auth`)

### 1.1. Đăng ký tài khoản
- **Endpoint:** `POST /auth/register`
- **Body:**
```json
{
  "username": "johndoe",
  "password": "password123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0987654321"
}
```

### 1.2. Đăng nhập
- **Endpoint:** `POST /auth/login`
- **Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

### 1.3. Làm mới Token
- **Endpoint:** `POST /auth/refresh-token`
- **Body:** (Không có body, yêu cầu `refreshToken` trong HttpOnly Cookie)

### 1.4. Đăng xuất
- **Endpoint:** `POST /auth/logout`
- **Body:** (Không có body, xóa `refreshToken` trong database và cookie)

---

## 2. Người dùng (`/users`)

### 2.1. Lấy danh sách người dùng (Admin)
- **Endpoint:** `GET /users`
- **Header:** `Authorization: Bearer <accessToken>`

### 2.2. Lấy thông tin chi tiết
- **Endpoint:** `GET /users/:id`

### 2.3. Tạo người dùng mới (Admin)
- **Endpoint:** `POST /users`
- **Body:**
```json
{
  "username": "admin2",
  "password": "adminpassword",
  "fullName": "Secondary Admin",
  "email": "admin2@example.com",
  "role": "65f1a..." // ObjectId của Role
}
```

### 2.4. Cập nhật thông tin
- **Endpoint:** `PUT /users/:id`
- **Body:**
```json
{
  "fullName": "John Updated",
  "email": "john_new@example.com",
  "phone": "0123456789",
  "avatarUrl": "/uploads/avatar.png"
}
```

### 2.5. Đổi mật khẩu
- **Endpoint:** `PUT /users/:id/change-password`
- **Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 3. Sản phẩm (`/products`)

### 3.1. Lấy danh sách sản phẩm
- **Endpoint:** `GET /products`
- **Query Params:** `?name=...&categoryId=...&page=1&limit=10`

### 3.2. Tạo mới sản phẩm (Admin)
- **Endpoint:** `POST /products`
- **Body:**
```json
{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Chip A17 Pro, Camera 48MP",
  "price": 28990000,
  "stock": 50,
  "categoryId": "65f2b...", // ObjectId
  "status": "in_stock",
  "discount": 5
}
```

### 3.3. Cập nhật sản phẩm (Admin)
- **Endpoint:** `PUT /products/:id`
- **Body:** (Tương tự Create)

---

## 4. Danh mục (`/categories`)

### 4.1. Lấy danh sách danh mục
- **Endpoint:** `GET /categories`

### 4.2. Tạo mới danh mục (Admin)
- **Endpoint:** `POST /categories`
- **Body:**
```json
{
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Các dòng điện thoại thông minh",
  "image": "/uploads/cat-phone.png"
}
```

---

## 5. Giỏ hàng (`/carts`)

### 5.1. Thêm sản phẩm vào giỏ
- **Endpoint:** `POST /carts/items`
- **Body:**
```json
{
  "productId": "65f3c...",
  "quantity": 2
}
```

### 5.2. Cập nhật số lượng
- **Endpoint:** `PATCH /carts/items/:productId`
- **Body:**
```json
{
  "quantity": 5
}
```

---

## 6. Địa chỉ (`/addresses`)

### 6.1. Thêm địa chỉ mới
- **Endpoint:** `POST /addresses`
- **Body:**
```json
{
  "receiverName": "John Doe",
  "phoneNumber": "0987654321",
  "street": "123 Đường ABC",
  "district": "Quận 1",
  "city": "TP. Hồ Chí Minh",
  "isDefault": true
}
```

---

## 7. Tải lên (`/upload`)

### 7.1. Upload hình ảnh
- **Endpoint:** `POST /upload`
- **Body:** `FormData` với field mang tên `image`.
- **Response:**
```json
{
  "success": true,
  "filename": "171213...-image.png",
  "avatarUrl": "/uploads/171213...-image.png"
}
```

---

## 8. Đơn hàng (`/orders`)

### 8.1. Đặt hàng (Checkout)
- **Endpoint:** `POST /orders/checkout`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body:**
```json
{
  "addressId": "65f4d...", // ObjectId của Address
  "paymentMethod": "COD", // "COD" hoặc "VNPAY" (Mặc định COD)
  "note": "Giao hàng giờ hành chính"
}
```

### 8.2. Lấy danh sách đơn hàng của tôi
- **Endpoint:** `GET /orders`
- **Header:** `Authorization: Bearer <accessToken>`
- **Query Params:** `?page=1&limit=10&status=PENDING`

### 8.3. Xem chi tiết đơn hàng
- **Endpoint:** `GET /orders/:id`
- **Header:** `Authorization: Bearer <accessToken>`

### 8.4. Hủy đơn hàng
- **Endpoint:** `PATCH /orders/:id/cancel`
- **Header:** `Authorization: Bearer <accessToken>`
- **Ghi chú:** Chỉ có thể hủy khi trạng thái là `PENDING`.

### 8.5. Lấy tất cả đơn hàng (Admin/Manager)
- **Endpoint:** `GET /orders/admin/all`
- **Header:** `Authorization: Bearer <accessToken>`
- **Query Params:** `?page=1&limit=10&status=PROCESSING`

### 8.6. Cập nhật trạng thái đơn hàng (Admin/Manager)
- **Endpoint:** `PATCH /orders/:id/status`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body:**
```json
{
  "status": "SHIPPED" // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

---

## 9. Chi tiết đơn hàng (`/order-items`)

### 9.1. Lấy danh sách sản phẩm trong đơn hàng
- **Endpoint:** `GET /order-items/order/:orderId`
- **Header:** `Authorization: Bearer <accessToken>`
