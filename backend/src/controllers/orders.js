const OrderModel = require('../schemas/orders');
const OrderItemModel = require('../schemas/orderItems');
const CartModel = require('../schemas/carts');
const ProductModel = require('../schemas/products');
const AddressModel = require('../schemas/addresses');
const PaymentModel = require('../schemas/payments');
const mongoose = require('mongoose');
const { createVnpayUrl, verifyVnpayReturn } = require('../utils/vnpayHelper');

module.exports = {
    /**
     * Checkout - Xử lý đặt hàng từ giỏ hàng
     * Trả về { paymentUrl } nếu VNPAY hoặc { order } nếu COD
     */
    Checkout: async function (userId, addressId, paymentMethod, note, ipAddr) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
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
                const paymentUrl = createVnpayUrl({
                    orderId: savedOrder._id.toString(),
                    amount: totalAmount,
                    returnUrl: `http://localhost:${process.env.PORT || 5000}/api/v1/orders/vnpay-return`,
                    ipAddr: ipAddr
                });
                return { paymentUrl: paymentUrl };
            }

            return { order: savedOrder };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },

    /**
     * Lấy danh sách đơn hàng có phân trang
     */
    GetOrders: async function (userId, userRole, page, limit, status) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const query = {};
        const isPrivileged = ['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase());
        if (!isPrivileged) {
            query.user = userId;
        }

        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate(isPrivileged ? 'user' : null, 'fullName email username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(query)
        ]);

        return {
            orders,
            total,
            page: page,
            totalPages: Math.ceil(total / limit)
        };
    },

    /**
     * Lấy chi tiết đơn hàng theo id
     */
    GetOrderById: async function (orderId, userId, userRole) {
        const order = await OrderModel.findById(orderId).populate('user', 'fullName email');
        if (!order) {
            let error = new Error("Không tìm thấy đơn hàng");
            error.status = 404;
            throw error;
        }

        const isPrivileged = ['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase());
        if (!isPrivileged && order.user._id.toString() !== userId.toString()) {
            let error = new Error("Bạn không có quyền xem đơn hàng này");
            error.status = 403;
            throw error;
        }

        const items = await OrderItemModel.find({ order: orderId }).populate('product', 'name images');
        return { order, items };
    },

    /**
     * Cập nhật trạng thái đơn hàng (ADMIN/MANAGER)
     */
    UpdateOrderStatus: async function (orderId, status) {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            let error = new Error("Không tìm thấy đơn hàng");
            error.status = 404;
            throw error;
        }

        order.status = status;
        await order.save();

        return order;
    },

    /**
     * Hủy đơn hàng - hoàn lại stock
     */
    CancelOrder: async function (orderId, userId) {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            let error = new Error("Không tìm thấy đơn hàng");
            error.status = 404;
            throw error;
        }

        if (order.user.toString() !== userId.toString()) {
            let error = new Error("Bạn không có quyền hủy đơn hàng này");
            error.status = 403;
            throw error;
        }

        if (order.status !== 'PENDING') {
            let error = new Error("Đơn hàng đã được xử lý, không thể hủy");
            error.status = 400;
            throw error;
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

            return order;
        } catch (txnError) {
            await session.abortTransaction();
            session.endSession();
            throw txnError;
        }
    },

    /**
     * Xử lý kết quả trả về từ VNPay
     * Trả về { redirectStatus, orderId }
     */
    VnpayReturn: async function (vnpParams) {
        const isValid = verifyVnpayReturn(vnpParams);

        if (!isValid) {
            return { redirectStatus: 'error' };
        }

        const orderId = vnpParams['vnp_TxnRef'];
        const responseCode = vnpParams['vnp_ResponseCode'];

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return { redirectStatus: 'not_found' };
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

            return { redirectStatus: 'success', orderId: orderId };
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

            return { redirectStatus: 'failed' };
        }
    }
};
