const OrderModel = require('../schemas/orders');
const OrderItemModel = require('../schemas/orderItems');
const CartModel = require('../schemas/carts');
const ProductModel = require('../schemas/products');
const AddressModel = require('../schemas/addresses');
const PaymentModel = require('../schemas/payments');
const mongoose = require('mongoose');
const { createVnpayUrl, verifyVnpayReturn } = require('../utils/vnpayHelper');

/**
 * Xử lý đặt hàng - tạo đơn từ giỏ hàng của user.
 * Kiểm tra tồn kho atomic, tạo order, payment, orderItems trong một transaction.
 * Nếu thanh toán COD thì commit ngay; nếu VNPAY thì redirect sang cổng thanh toán.
 */
let checkout = async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { addressId, paymentMethod, note } = req.body;

        const address = await AddressModel.findOne({ _id: addressId, user: userId });
        if (!address) {
            throw new Error("Địa chỉ không hợp lệ");
        }

        const cart = await CartModel.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            throw new Error("Giỏ hàng của bạn đang trống");
        }

        let totalAmount = 0;
        const itemIdsAndPrices = [];

        for (const item of cart.items) {
            const product = item.productId;

            if (!product) {
                throw new Error("Có sản phẩm trong giỏ hàng không tồn tại");
            }

            const updatedProduct = await ProductModel.findOneAndUpdate(
                { _id: product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { session, new: true }
            );

            if (!updatedProduct) {
                const currentProduct = await ProductModel.findById(product._id).session(session);
                const available = currentProduct ? currentProduct.stock : 0;
                throw new Error(
                    `Sản phẩm "${product.name}" không đủ số lượng (còn ${available}, cần ${item.quantity})`
                );
            }

            // Đồng bộ trạng thái out_of_stock nếu hết hàng
            if (updatedProduct.stock === 0) {
                updatedProduct.status = 'out_of_stock';
                await updatedProduct.save({ session });
            }

            const priceToBuy = product.discount
                ? product.price - (product.price * product.discount / 100)
                : product.price;
            totalAmount += priceToBuy * item.quantity;

            itemIdsAndPrices.push({
                product: product._id,
                quantity: item.quantity,
                price: priceToBuy
            });
        }

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
            paymentMethod: paymentMethod,
            note: note || ''
        });
        const savedOrder = await newOrder.save({ session });

        const payment = new PaymentModel({
            order: savedOrder._id,
            user: userId,
            method: paymentMethod,
            amount: totalAmount,
            status: 'PENDING'
        });
        await payment.save({ session });

        const orderItemsDocs = itemIdsAndPrices.map(item => ({
            order: savedOrder._id,
            product: item.product,
            quantity: item.quantity,
            price: item.price
        }));
        await OrderItemModel.insertMany(orderItemsDocs, { session });

        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        if (paymentMethod === 'VNPAY') {
            const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const paymentUrl = createVnpayUrl({
                orderId: savedOrder._id.toString(),
                amount: totalAmount,
                returnUrl: `http://localhost:${process.env.PORT || 5000}/api/v1/orders/vnpay-return`,
                ipAddr: ipAddr
            });

            return res.status(200).send({
                success: true,
                message: "Vui lòng chuyển hướng sang VNPAY",
                data: { paymentUrl }
            });
        }

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
            error: { code: "CHECKOUT_FAILED", details: error.message }
        });
    }
};

/**
 * Lấy danh sách đơn hàng có phân trang.
 * ADMIN/MANAGER thấy toàn bộ đơn, CUSTOMER chỉ thấy đơn của mình.
 * Hỗ trợ lọc theo status qua query param.
 */
let getOrders = async function (req, res) {
    try {
        const userId = req.user._id;
        const userRole = req.user.role?.name || req.user.role;
        const { page = 1, limit = 10, status } = req.query;

        const query = {};
        const isPrivileged = ['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase());
        if (!isPrivileged) {
            query.user = userId;
        }

        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate(isPrivileged ? 'user' : null, 'fullName email username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            OrderModel.countDocuments(query)
        ]);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: {
                orders,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách đơn hàng thất bại",
            error: { code: "FETCH_ORDERS_FAILED", details: error.message }
        });
    }
};

/**
 * Lấy chi tiết một đơn hàng theo id.
 * ADMIN/MANAGER được xem mọi đơn, CUSTOMER chỉ được xem đơn của mình.
 */
let getOrderById = async function (req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;
        const userRole = req.user.role?.name || req.user.role;

        const order = await OrderModel.findById(orderId).populate('user', 'fullName email');
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy đơn hàng",
                error: { code: "ORDER_NOT_FOUND" }
            });
        }

        const isPrivileged = ['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase());
        if (!isPrivileged && order.user._id.toString() !== userId.toString()) {
            return res.status(403).send({
                success: false,
                message: "Bạn không có quyền xem đơn hàng này",
                error: { code: "FORBIDDEN" }
            });
        }

        const items = await OrderItemModel.find({ order: orderId }).populate('product', 'name images');

        return res.status(200).send({
            success: true,
            message: "Lấy chi tiết đơn hàng thành công",
            data: { order, items }
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy chi tiết đơn hàng thất bại",
            error: { code: "FETCH_ORDER_FAILED", details: error.message }
        });
    }
};

/**
 * Cập nhật trạng thái đơn hàng (ADMIN/MANAGER).
 * Trạng thái hợp lệ: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED.
 */
let updateOrderStatus = async function (req, res) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy đơn hàng",
                error: { code: "ORDER_NOT_FOUND" }
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).send({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: order
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Cập nhật trạng thái đơn hàng thất bại",
            error: { code: "UPDATE_STATUS_FAILED", details: error.message }
        });
    }
};

/**
 * Hủy đơn hàng - chỉ chủ đơn hàng được hủy, và chỉ khi trạng thái là PENDING.
 * Khi hủy sẽ hoàn lại số lượng tồn kho cho các sản phẩm trong đơn.
 */
let cancelOrder = async function (req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy đơn hàng",
                error: { code: "ORDER_NOT_FOUND" }
            });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).send({
                success: false,
                message: "Bạn không có quyền hủy đơn hàng này",
                error: { code: "FORBIDDEN" }
            });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).send({
                success: false,
                message: "Đơn hàng đã được xử lý, không thể hủy",
                error: { code: "INVALID_ORDER_STATUS" }
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            order.status = 'CANCELLED';
            await order.save({ session });

            const items = await OrderItemModel.find({ order: orderId }).session(session);
            for (const item of items) {
                const updated = await ProductModel.findOneAndUpdate(
                    { _id: item.product },
                    { $inc: { stock: item.quantity } },
                    { session, new: true }
                );

                if (updated && updated.stock > 0 && updated.status === 'out_of_stock') {
                    updated.status = 'in_stock';
                    await updated.save({ session });
                }
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
        return res.status(500).send({
            success: false,
            message: "Hủy đơn hàng thất bại",
            error: { code: "CANCEL_ORDER_FAILED", details: error.message }
        });
    }
};

/**
 * Xử lý kết quả trả về từ VNPay sau khi thanh toán.
 * Thành công (responseCode = 00): cập nhật payment COMPLETED, chuyển order sang PROCESSING.
 * Thất bại: cập nhật payment FAILED, hủy đơn hàng và hoàn lại stock cho các sản phẩm.
 */
let vnpayReturn = async function (req, res, next) {
    try {
        const vnpParams = req.query;
        const isValid = verifyVnpayReturn(vnpParams);

        if (!isValid) {
            return res.redirect(`${process.env.CORS_ORIGIN}/payment-result?status=error`);
        }

        const orderId = vnpParams['vnp_TxnRef'];
        const responseCode = vnpParams['vnp_ResponseCode'];

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.redirect(`${process.env.CORS_ORIGIN}/payment-result?status=not_found`);
        }

        if (responseCode === '00') {
            order.paymentStatus = 'COMPLETED';
            order.status = 'PROCESSING';
            await order.save();

            await PaymentModel.findOneAndUpdate(
                { order: orderId },
                {
                    status: 'COMPLETED',
                    vnpayData: vnpParams,
                    transactionRef: vnpParams['vnp_TransactionNo'],
                    paidAt: new Date()
                }
            );

            return res.redirect(`${process.env.CORS_ORIGIN}/payment-result?status=success&orderId=${orderId}`);
        } else {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                order.paymentStatus = 'FAILED';
                order.status = 'CANCELLED';
                await order.save({ session });

                await PaymentModel.findOneAndUpdate(
                    { order: orderId },
                    { status: 'FAILED', vnpayData: vnpParams },
                    { session }
                );

                const orderItems = await OrderItemModel.find({ order: orderId }).session(session);
                for (const item of orderItems) {
                    const updated = await ProductModel.findOneAndUpdate(
                        { _id: item.product },
                        { $inc: { stock: item.quantity } },
                        { session, new: true }
                    );

                    if (updated && updated.stock > 0 && updated.status === 'out_of_stock') {
                        updated.status = 'in_stock';
                        await updated.save({ session });
                    }
                }

                await session.commitTransaction();
                session.endSession();
            } catch (txnError) {
                await session.abortTransaction();
                session.endSession();
                console.error("Lỗi khi hoàn stock sau thanh toán thất bại:", txnError);
            }

            return res.redirect(`${process.env.CORS_ORIGIN}/payment-result?status=failed`);
        }
    } catch (error) {
        next(error);
    }
};


module.exports = {
    checkout,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    vnpayReturn
};
