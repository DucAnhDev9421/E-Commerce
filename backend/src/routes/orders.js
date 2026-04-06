const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');
const { verifyToken, checkRole } = require('../utils/authHandler');
const { validateCheckout, validateUpdateStatus, validateCancelOrder, validateGetOrderById } = require('../utils/orderValidator');
const { checkoutRateLimiter, ordersApiRateLimiter, adminOrdersRateLimiter } = require('../utils/orderRateLimiter');

/**
 * ============================================================
 * USER ROUTES (CUSTOMER)
 * ============================================================
 */
// POST /orders/checkout
// Rate limit: 1 request / 15s (chống double-click spam)
// Validation: express-validator (addressId + paymentMethod bắt buộc)
router.post(
    '/checkout',
    verifyToken,
    checkoutRateLimiter,
    validateCheckout,
    ordersController.checkout
);

// GET /orders → Lấy đơn hàng của chính mình
// Dùng chung getOrders, tự phân biệt theo role (DRY)
router.get(
    '/',
    verifyToken,
    ordersApiRateLimiter,
    ordersController.getOrders
);

// GET /orders/vnpay-return → VNPay callback (không cần auth)
router.get('/vnpay-return', ordersController.vnpayReturn);

// GET /orders/:id → Chi tiết đơn hàng
// Validation: orderId phải là MongoId
router.get(
    '/:id',
    verifyToken,
    validateGetOrderById,
    ordersController.getOrderById
);

// PATCH /orders/:id/cancel → Hủy đơn hàng (chỉ chủ đơn)
// Validation: orderId phải là MongoId
router.patch(
    '/:id/cancel',
    verifyToken,
    validateCancelOrder,
    ordersController.cancelOrder
);

/**
 * ADMIN / MANAGER ROUTES
 * RBAC: checkRole('ADMIN', 'MANAGER') chặn user thường
 * Rate limit riêng cho admin (60 req/phút)
 * Validation: express-validator cho status update
 */
// GET /orders/admin/all → Lấy toàn bộ đơn hàng (ADMIN/MANAGER)
router.get(
    '/admin/all',
    verifyToken,
    checkRole('ADMIN', 'MANAGER'),
    adminOrdersRateLimiter,
    ordersController.getOrders
);

// PATCH /orders/:id/status → Cập nhật trạng thái đơn hàng
router.patch(
    '/:id/status',
    verifyToken,
    checkRole('ADMIN', 'MANAGER'),
    adminOrdersRateLimiter,
    validateUpdateStatus,
    ordersController.updateOrderStatus
);


module.exports = router;
