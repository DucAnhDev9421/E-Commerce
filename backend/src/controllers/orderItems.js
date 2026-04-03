const OrderItemModel = require('../schemas/orderItems');
const OrderModel = require('../schemas/orders');

let getOrderItemsByOrder = async function(req, res) {
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

        const items = await OrderItemModel.find({ order: orderId }).populate('product', 'name images price');

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách sản phẩm trong đơn hàng thành công",
            data: items
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    getOrderItemsByOrder
};
