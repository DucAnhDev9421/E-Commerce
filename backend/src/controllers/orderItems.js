const OrderItemModel = require('../schemas/orderItems');

module.exports = {
    GetOrderItemsByOrder: async function (orderId) {
        return await OrderItemModel.find({ order: orderId })
            .populate('product', 'name images price');
    }
};
