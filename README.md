# E-Commerce

Bo tai lieu nay giup khoi dong du an E-Commerce theo huong monorepo (Backend + Frontend), de mo rong va ban giao de dang.

## Tai lieu chinh

- `docs/PROJECT_OVERVIEW.md`: Muc tieu, pham vi, tech stack, va architecture tong quan.
- `docs/SETUP_AND_RUN.md`: Huong dan cai dat, bien moi truong, va lenh chay local.
- `docs/API_CONVENTIONS.md`: Quy uoc thiet ke REST API, auth, response, pagination.
- `docs/RESTFUL_ENDPOINTS.md`: Danh sach endpoint de xuat cho 12 model.
- `docs/ROADMAP.md`: Lo trinh implementation theo phase.

## De xuat cau truc thu muc ma nguon

```text
backend/
frontend/
docs/
```

## Trang thai hien tai

- Da setup khung monorepo `backend` va `frontend`.
- Backend da co health check: `GET /api/health`.
- Frontend da khoi tao React + Vite va build thanh cong.

## Chay nhanh du an

```bash
npm install
npm run dev
```