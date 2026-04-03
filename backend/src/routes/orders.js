const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const { verifyToken, checkRole } = require('../utils/authHandler');

// User routes
router.post('/checkout', verifyToken, ordersController.checkout);
router.get('/', verifyToken, ordersController.getMyOrders); // Lấy danh sách đơn của user
//Nhận data từ VNPay (để trên cùng tránh bị match nhầm vào /:id)
router.get('/vnpay-return', ordersController.vnpayReturn);

router.get('/:id', verifyToken, ordersController.getOrderById); // Chi tiết đơn
router.patch('/:id/cancel', verifyToken, ordersController.cancelOrder);

// Admin/Manager routes
router.get('/admin/all', verifyToken, checkRole('ADMIN', 'MANAGER'), ordersController.getAllOrders);
router.patch('/:id/status', verifyToken, checkRole('ADMIN', 'MANAGER'), ordersController.updateOrderStatus);


module.exports = router;
