const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItems');
const { verifyToken } = require('../utils/authHandler');

router.get('/order/:orderId', verifyToken, orderItemsController.getOrderItemsByOrder);

module.exports = router;
