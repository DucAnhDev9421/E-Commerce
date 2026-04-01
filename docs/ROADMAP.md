# Roadmap

## Phase 1 - Foundation

- Tao skeleton monorepo (`backend`, `frontend`).
- Setup lint/format cho FE va BE.
- Tao base config (`.env.example`, logger, error middleware).
- Tao health check API.

## Phase 2 - Authentication & User

- Schema `Role`, `User`, `Address`.
- Dang ky, dang nhap, refresh token, dang xuat.
- Middleware auth + phan quyen role.
- Trang login/register phia frontend.

## Phase 3 - Catalog & Cart

- Schema `Category`, `Product`, `ProductImage`, `Cart`.
- CRUD category/product (admin).
- Product listing + filtering + pagination (client).
- Cart APIs va UI gio hang.

## Phase 4 - Checkout & Payment

- Schema `Order`, `OrderItem`, `Payment`.
- Checkout voi MongoDB transaction.
- Tich hop VNPay URL + callback IPN.
- Order history cho user.

## Phase 5 - Engagement & Realtime

- Schema `Review`, `Notification`.
- User review san pham.
- Socket.io thong bao thay doi trang thai don.
- Hien thi toast notification realtime tren FE.

## Phase 6 - Hardening & Release

- Test unit/integration cho luong quan trong.
- Gioi han upload, validate input, rate limit.
- Docker hoa va bo sung CI/CD co ban.
- Hoan thien tai lieu deploy.
