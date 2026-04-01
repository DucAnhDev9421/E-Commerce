# Project Overview - E-Commerce

## 1. Muc tieu

Xay dung he thong E-Commerce fullstack bao gom:
- Backend API theo RESTful.
- Frontend React phuc vu khach hang va quan tri.
- Ho tro thanh toan, gio hang, don hang, danh gia, thong bao.

## 2. Tech Stack

- Backend: Node.js, Express.js.
- Database: MongoDB + Mongoose.
- Frontend: React, Tailwind CSS, Ant Design.
- Data Fetching: TanStack Query + Axios.
- Real-time: Socket.io.
- Thanh toan: VNPay.
- Upload file: Multer (local/cloud).

## 3. Kien truc de xuat

- Kieu du an: Monorepo (`backend`, `frontend`).
- Backend theo MVC + Service layer.
- FE tach rieng API services, pages, components, layouts.
- Quy trinh nghiep vu checkout bat buoc transaction.

## 4. Doi tuong chinh trong he thong

- User va Role.
- Product va Category.
- Cart, Order, OrderItem.
- Payment, Review, Notification.

## 5. Nguyen tac ky thuat

- Khong hardcode secret; dung `process.env`.
- Controller co `try/catch` va global error handler.
- API list ho tro pagination + sorting + filtering.
- Authorization theo role (`ADMIN`, `CUSTOMER`, `MANAGER`).
- Giu response format thong nhat.
