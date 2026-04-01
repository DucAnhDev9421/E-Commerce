# Setup and Run

## 1. Yeu cau

- Node.js 20+.
- npm 10+.
- MongoDB Atlas (khuyen nghi) hoac local MongoDB.

## 2. Cau truc thu muc ky vong

```text
E-Commerce/
  backend/
  frontend/
  docs/
```

## 3. Bien moi truong de xuat

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=
VNPAY_RETURN_URL=
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 4. Khoi tao package (khi bat dau code)

Tai root:

```bash
npm init -y
```

Tai `backend`:

```bash
npm init -y
```

Tai `frontend` (Vite):

```bash
npm create vite@latest frontend -- --template react
```

## 5. Lenh chay local de xuat

- Backend: `npm run dev` trong `backend`.
- Frontend: `npm run dev` trong `frontend`.
- Neu dung monorepo scripts o root, co the chay song song 2 service bang `concurrently`.

## 6. Kiem tra nhanh sau khi chay

- FE mo duoc trang localhost cua Vite.
- BE tra ve `200 OK` cho health check (vd: `GET /api/health`).
- FE goi API base URL thanh cong.
