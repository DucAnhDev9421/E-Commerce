# API Conventions

## 1. Nguyen tac chung

- Follow RESTful naming.
- Dung dung HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Endpoint dat theo resource so nhieu, vd: `/api/products`.

## 2. Response format thong nhat

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Loi:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

## 3. Auth va Authorization

- Access token ngan han, refresh token dai han (httpOnly cookie).
- Middleware de xuat:
  - `verifyToken`
  - `checkRole([roles])`
- Route quan tri (product/category CRUD) chi cho `ADMIN`.

## 4. Pagination, sorting, filtering

Danh sach phai ho tro:
- `page` (default: 1)
- `limit` (default: 10)
- `sort` (vd: `createdAt:desc`)
- `q` hoac filter fields (vd: `category`, `minPrice`, `maxPrice`)

## 5. Error handling

- Dung HTTP status phu hop: `400`, `401`, `403`, `404`, `409`, `500`.
- Tat ca controller co `try/catch`.
- Day loi qua global error middleware.

## 6. Checkout transaction (bat buoc)

Trong mot transaction:
1. Validate ton kho.
2. Tru ton kho product.
3. Tao order + order items.
4. Cap nhat payment state ban dau (neu co).
5. Xoa item da mua khoi cart.
6. Loi bat ky buoc nao -> rollback toan bo.
