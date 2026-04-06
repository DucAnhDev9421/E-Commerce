let express = require('express');
let router = express.Router();
let paymentsController = require('../controllers/payments');
let { verifyToken, checkRole } = require('../utils/authHandler');

// User: get my payments
router.get('/me', verifyToken, paymentsController.getPaymentsByUser);

// Admin: get all payments
router.get('/', verifyToken, checkRole('ADMIN', 'MANAGER'), paymentsController.getAllPayments);

// Admin: payment stats
router.get('/stats', verifyToken, checkRole('ADMIN', 'MANAGER'), paymentsController.getPaymentStats);

// Admin: get payment by id
router.get('/:id', verifyToken, checkRole('ADMIN', 'MANAGER'), paymentsController.getPaymentById);

// Admin: update payment status
router.patch('/:id/status', verifyToken, checkRole('ADMIN', 'MANAGER'), paymentsController.updatePaymentStatus);

module.exports = router;
