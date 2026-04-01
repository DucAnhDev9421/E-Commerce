# RESTful Endpoints - E-Commerce

Tai lieu nay mo ta bo API de xuat cho 12 model theo chuan RESTful.

## 1. Auth

- `POST /api/auth/register` - Dang ky tai khoan.
- `POST /api/auth/login` - Dang nhap, cap access token + refresh token.
- `POST /api/auth/refresh-token` - Cap moi access token.
- `POST /api/auth/logout` - Dang xuat.
- `GET /api/auth/me` - Lay thong tin user hien tai.

## 2. Roles (Admin)

- `GET /api/roles` - Lay danh sach role.
- `POST /api/roles` - Tao role moi.
- `PATCH /api/roles/:id` - Cap nhat role.
- `DELETE /api/roles/:id` - Xoa role.

## 3. Users

- `GET /api/users` - Lay danh sach user (Admin/Manager).
- `GET /api/users/:id` - Lay chi tiet user.
- `PATCH /api/users/:id` - Cap nhat thong tin user.
- `PATCH /api/users/:id/status` - Khoa/mo tai khoan.
- `DELETE /api/users/:id` - Xoa user (Admin).

## 4. Addresses

- `GET /api/addresses` - Lay danh sach dia chi cua user dang nhap.
- `POST /api/addresses` - Tao dia chi moi.
- `PATCH /api/addresses/:id` - Cap nhat dia chi.
- `DELETE /api/addresses/:id` - Xoa dia chi.
- `PATCH /api/addresses/:id/default` - Dat dia chi mac dinh.

## 5. Categories

- `GET /api/categories` - Lay danh sach category.
- `GET /api/categories/:id` - Lay chi tiet category.
- `POST /api/categories` - Tao category (Admin).
- `PATCH /api/categories/:id` - Cap nhat category (Admin).
- `DELETE /api/categories/:id` - Xoa category (Admin).

## 6. Products

- `GET /api/products` - Lay danh sach san pham (pagination/sort/filter).
- `GET /api/products/:id` - Lay chi tiet san pham.
- `POST /api/products` - Tao san pham (Admin).
- `PATCH /api/products/:id` - Cap nhat san pham (Admin).
- `DELETE /api/products/:id` - Xoa san pham (Admin).
- `PATCH /api/products/:id/stock` - Dieu chinh ton kho (Admin/Manager).

## 7. Product Images

- `GET /api/products/:productId/images` - Lay danh sach anh phu.
- `POST /api/products/:productId/images` - Upload them anh.
- `PATCH /api/product-images/:id` - Cap nhat metadata anh.
- `DELETE /api/product-images/:id` - Xoa anh.

## 8. Cart

- `GET /api/cart` - Lay gio hang cua user.
- `POST /api/cart/items` - Them san pham vao gio.
- `PATCH /api/cart/items/:itemId` - Cap nhat so luong item.
- `DELETE /api/cart/items/:itemId` - Xoa item khoi gio.
- `DELETE /api/cart/clear` - Xoa toan bo gio hang.

## 9. Orders

- `GET /api/orders` - Lay danh sach don hang (user: don cua minh, admin: tat ca).
- `GET /api/orders/:id` - Lay chi tiet don.
- `POST /api/orders/checkout` - Tao don moi tu cart (transaction bat buoc).
- `PATCH /api/orders/:id/status` - Cap nhat trang thai don (Admin/Manager).
- `PATCH /api/orders/:id/cancel` - User huy don (neu hop le).

## 10. Order Items

- `GET /api/orders/:orderId/items` - Lay danh sach item trong don.
- `GET /api/order-items/:id` - Lay chi tiet item.

## 11. Payments (VNPay)

- `POST /api/payments/vnpay/create-url` - Tao URL thanh toan VNPay.
- `GET /api/payments/vnpay/return` - Return URL sau thanh toan.
- `GET /api/payments/vnpay/ipn` - VNPay callback IPN de cap nhat trang thai.
- `GET /api/payments/:id` - Lay thong tin payment.

## 12. Reviews

- `GET /api/products/:productId/reviews` - Lay danh sach danh gia cua san pham.
- `POST /api/products/:productId/reviews` - Tao review (chi user da mua).
- `PATCH /api/reviews/:id` - Sua review cua chinh minh.
- `DELETE /api/reviews/:id` - Xoa review (owner/admin).

## 13. Notifications

- `GET /api/notifications` - Lay danh sach thong bao cua user.
- `PATCH /api/notifications/:id/read` - Danh dau da doc.
- `PATCH /api/notifications/read-all` - Danh dau tat ca da doc.
- `DELETE /api/notifications/:id` - Xoa thong bao.

## 14. Query conventions

Ap dung cho endpoint list:
- `page`: trang hien tai (default 1)
- `limit`: so ban ghi/trang (default 10)
- `sort`: vi du `createdAt:desc` hoac `price:asc`
- `q`: tim kiem text
- filter field rieng, vi du `status=PENDING`, `category=...`

## 15. Response conventions

Thanh cong:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

That bai:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```
