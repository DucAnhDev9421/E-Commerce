const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItems');
const OrderModel = require('../schemas/orders');
const { verifyToken } = require('../utils/authHandler');

router.get('/order/:orderId', verifyToken, async function (req, res, next) {
    try {
        const orderId = req.params.orderId;
        const userId = req.user._id;
        const userRole = req.user.role.name;

        // Tránh bị lộ info order của người khác
        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        if (userRole !== 'ADMIN' && userRole !== 'MANAGER' && order.user.toString() !== userId.toString()) {
            return res.status(403).send({ success: false, message: "Bạn không có quyền xem thông tin đơn hàng này" });
        }

        let result = await orderItemsController.GetOrderItemsByOrder(orderId);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách sản phẩm trong đơn hàng thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
