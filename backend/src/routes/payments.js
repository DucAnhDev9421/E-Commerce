let express = require('express');
let router = express.Router();
let paymentsController = require('../controllers/payments');
let { verifyToken, checkRole } = require('../utils/authHandler');

// User: get my payments
router.get('/me', verifyToken, async function (req, res, next) {
    try {
        const { page, limit, status } = req.query;

        let result = await paymentsController.GetPaymentsByUser(
            req.user._id, page, limit, status
        );

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách thanh toán thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách thanh toán thất bại",
            error: { code: "FETCH_PAYMENTS_FAILED", details: error.message }
        });
    }
});

// Admin: get all payments
router.get('/', verifyToken, checkRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        const { page, limit, status, method } = req.query;

        let result = await paymentsController.GetAllPayments(page, limit, status, method);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách thanh toán thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách thanh toán thất bại",
            error: { code: "FETCH_PAYMENTS_FAILED", details: error.message }
        });
    }
});

// Admin: payment stats
router.get('/stats', verifyToken, checkRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        let result = await paymentsController.GetPaymentStats();

        return res.status(200).send({
            success: true,
            message: "Lấy thống kê thanh toán thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy thống kê thanh toán thất bại",
            error: { code: "FETCH_STATS_FAILED", details: error.message }
        });
    }
});

// Admin: get payment by id
router.get('/:id', verifyToken, checkRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        let result = await paymentsController.GetPaymentById(req.params.id);

        if (!result) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy thanh toán",
                error: { code: "PAYMENT_NOT_FOUND" }
            });
        }

        return res.status(200).send({
            success: true,
            message: "Lấy chi tiết thanh toán thành công",
            data: result
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy chi tiết thanh toán thất bại",
            error: { code: "FETCH_PAYMENT_FAILED", details: error.message }
        });
    }
});

// Admin: update payment status
router.patch('/:id/status', verifyToken, checkRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        const { status } = req.body;

        let result = await paymentsController.UpdatePaymentStatus(req.params.id, status);

        return res.status(200).send({
            success: true,
            message: "Cập nhật trạng thái thanh toán thành công",
            data: result
        });
    } catch (error) {
        let statusCode = error.status || 500;
        return res.status(statusCode).send({
            success: false,
            message: error.message || "Cập nhật trạng thái thanh toán thất bại",
            error: { code: "UPDATE_PAYMENT_FAILED", details: error.message }
        });
    }
});

module.exports = router;
