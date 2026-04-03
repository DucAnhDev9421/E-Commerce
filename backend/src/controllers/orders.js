const OrderModel = require('../schemas/orders');
const OrderItemModel = require('../schemas/orderItems');
const CartModel = require('../schemas/carts');
const ProductModel = require('../schemas/products');
const AddressModel = require('../schemas/addresses');
const mongoose = require('mongoose');

let checkout = async function(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { addressId, paymentMethod, note } = req.body;

        if (!addressId) {
            throw new Error("Vui lòng chọn địa chỉ giao hàng");
        }

        // 1. Lấy và kiểm tra Address
        const address = await AddressModel.findOne({ _id: addressId, user: userId });
        if (!address) {
            throw new Error("Địa chỉ không hợp lệ");
        }

        // 2. Lấy Cart
        const cart = await CartModel.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            throw new Error("Giỏ hàng của bạn đang trống");
        }

        let totalAmount = 0;
        const itemIdsAndPrices = [];

        // 3. Kiểm tra Stock sản phẩm
        for (const item of cart.items) {
            const product = item.productId; // Đã populate nên nó là object Product
            
            if (!product) {
                throw new Error("Có sản phẩm trong giỏ hàng không tồn tại");
            }
            if (product.stock < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} không đủ số lượng (còn ${product.stock})`);
            }

            // Tính tiền
            const priceToBuy = product.discount ? product.price - (product.price * product.discount / 100) : product.price;
            totalAmount += priceToBuy * item.quantity;
            itemIdsAndPrices.push({
                product: product._id,
                quantity: item.quantity,
                price: priceToBuy
            });

            // Trừ stock
            await ProductModel.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // 4. Tạo Order
        const newOrder = new OrderModel({
            user: userId,
            totalAmount: totalAmount,
            shippingAddress: {
                receiverName: address.receiverName,
                phoneNumber: address.phoneNumber,
                street: address.street,
                city: address.city,
                district: address.district
            },
            paymentMethod: paymentMethod || 'COD',
            note: note || ''
        });

        const savedOrder = await newOrder.save({ session });

        // 5. Tạo OrderItems
        const orderItemsDocs = itemIdsAndPrices.map(item => ({
            order: savedOrder._id,
            product: item.product,
            quantity: item.quantity,
            price: item.price
        }));

        await OrderItemModel.insertMany(orderItemsDocs, { session });

        // 6. Xóa các mặt hàng trong Cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({
            success: true,
            message: "Đặt hàng thành công",
            data: savedOrder
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
            success: false,
            message: "Đặt hàng thất bại",
            error: error.message
        });
    }
};

let getMyOrders = async function(req, res) {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { user: userId };
        if (status) query.status = status;

        const orders = await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await OrderModel.countDocuments(query);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: {
                orders,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

let getAllOrders = async function(req, res) {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = {};
        if (status) query.status = status;

        const orders = await OrderModel.find(query)
            .populate('user', 'fullName email username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await OrderModel.countDocuments(query);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: {
                orders,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

let getOrderById = async function(req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;
        const userRole = req.user.role.name; // 'ADMIN', 'MANAGER', 'CUSTOMER'

        const order = await OrderModel.findById(orderId).populate('user', 'fullName email');
        if (!order) {
            return res.status(404).send({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // Kiểm tra quyền (chỉ ADMIN/MANAGER hoặc chủ đơn hàng mới được xem)
        if (userRole !== 'ADMIN' && userRole !== 'MANAGER' && order.user._id.toString() !== userId.toString()) {
            return res.status(403).send({ success: false, message: "Bạn không có quyền xem đơn hàng này" });
        }

        // Lấy chi tiết items
        const items = await OrderItemModel.find({ order: orderId }).populate('product', 'name images');

        return res.status(200).send({
            success: true,
            message: "Lấy chi tiết đơn hàng thành công",
            data: { order, items }
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

let updateOrderStatus = async function(req, res) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send({ success: false, message: "Trạng thái không hợp lệ" });
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        order.status = status;
        await order.save();

        return res.status(200).send({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: order
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

let cancelOrder = async function(req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // Chỉ chủ đơn hàng mới được hủy
        if (order.user.toString() !== userId.toString()) {
            return res.status(403).send({ success: false, message: "Bạn không có quyền hủy đơn hàng này" });
        }

        // Chỉ hủy nếu trạng thái là PENDING
        if (order.status !== 'PENDING') {
            return res.status(400).send({ success: false, message: "Đơn hàng đã được xử lý, không thể hủy" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            order.status = 'CANCELLED';
            await order.save({ session });

            // Trả lại stock
            const items = await OrderItemModel.find({ order: orderId });
            for (const item of items) {
                await ProductModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();

            return res.status(200).send({
                success: true,
                message: "Hủy đơn hàng thành công",
                data: order
            });
        } catch (txnError) {
            await session.abortTransaction();
            session.endSession();
            throw txnError;
        }

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    checkout,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
