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
router.post('/checkout', verifyToken, checkoutRateLimiter, validateCheckout, async function (req, res, next) {
    try {
        const { addressId, paymentMethod, note } = req.body;
        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        let result = await ordersController.Checkout(
            req.user._id, addressId, paymentMethod, note, ipAddr
        );

        if (result.paymentUrl) {
            return res.status(200).send({
                success: true,
                message: "Vui lòng chuyển hướng sang VNPAY",
                data: { paymentUrl: result.paymentUrl }
            });
        }

        return res.status(200).send({
            success: true,
            message: "Đặt hàng thành công",
            data: result.order
        });

    } catch (error) {
        return res.status(400).send({
            success: false,
            message: "Đặt hàng thất bại",
            error: { code: "CHECKOUT_FAILED", details: error.message }
        });
    }
});

// GET /orders
router.get('/', verifyToken, ordersApiRateLimiter, async function (req, res, next) {
    try {
        const userRole = req.user.role?.name || req.user.role;
        const { page, limit, status } = req.query;

        let result = await ordersController.GetOrders(
            req.user._id, userRole, page, limit, status
        );

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách đơn hàng thất bại",
            error: { code: "FETCH_ORDERS_FAILED", details: error.message }
        });
    }
});

// GET /orders/vnpay-return
router.get('/vnpay-return', async function (req, res, next) {
    try {
        let result = await ordersController.VnpayReturn(req.query);
        const baseUrl = process.env.CORS_ORIGIN;

        if (result.redirectStatus === 'success') {
            return res.redirect(`${baseUrl}/payment-result?status=success&orderId=${result.orderId}`);
        } else if (result.redirectStatus === 'not_found') {
            return res.redirect(`${baseUrl}/payment-result?status=not_found`);
        } else if (result.redirectStatus === 'error') {
            return res.redirect(`${baseUrl}/payment-result?status=error`);
        } else {
            return res.redirect(`${baseUrl}/payment-result?status=failed`);
        }
    } catch (error) {
        next(error);
    }
});

// GET /orders/:id
router.get('/:id', verifyToken, validateGetOrderById, async function (req, res, next) {
    try {
        const userRole = req.user.role?.name || req.user.role;

        let result = await ordersController.GetOrderById(
            req.params.id, req.user._id, userRole
        );

        return res.status(200).send({
            success: true,
            message: "Lấy chi tiết đơn hàng thành công",
            data: result
        });
    } catch (error) {
        let status = error.status || 500;
        return res.status(status).send({
            success: false,
            message: error.message || "Lấy chi tiết đơn hàng thất bại",
            error: { code: "FETCH_ORDER_FAILED", details: error.message }
        });
    }
});

// PATCH /orders/:id/cancel
router.patch('/:id/cancel', verifyToken, validateCancelOrder, async function (req, res, next) {
    try {
        let result = await ordersController.CancelOrder(
            req.params.id, req.user._id
        );

        return res.status(200).send({
            success: true,
            message: "Hủy đơn hàng thành công",
            data: result
        });
    } catch (error) {
        let status = error.status || 500;
        return res.status(status).send({
            success: false,
            message: error.message || "Hủy đơn hàng thất bại",
            error: { code: "CANCEL_ORDER_FAILED", details: error.message }
        });
    }
});

/**
 * ============================================================
 * ADMIN / MANAGER ROUTES
 * ============================================================
 */

// GET /orders/admin/all
router.get('/admin/all', verifyToken, checkRole('ADMIN', 'MANAGER'), adminOrdersRateLimiter, async function (req, res, next) {
    try {
        const userRole = req.user.role?.name || req.user.role;
        const { page, limit, status } = req.query;

        let result = await ordersController.GetOrders(
            req.user._id, userRole, page, limit, status
        );

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách đơn hàng thất bại",
            error: { code: "FETCH_ORDERS_FAILED", details: error.message }
        });
    }
});

// PATCH /orders/:id/status
router.patch('/:id/status', verifyToken, checkRole('ADMIN', 'MANAGER'), adminOrdersRateLimiter, validateUpdateStatus, async function (req, res, next) {
    try {
        const { status } = req.body;
        let result = await ordersController.UpdateOrderStatus(req.params.id, status);

        return res.status(200).send({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: result
        });
    } catch (error) {
        let statusCode = error.status || 500;
        return res.status(statusCode).send({
            success: false,
            message: error.message || "Cập nhật trạng thái đơn hàng thất bại",
            error: { code: "UPDATE_STATUS_FAILED", details: error.message }
        });
    }
});


module.exports = router;
