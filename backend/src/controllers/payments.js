let PaymentModel = require('../schemas/payments');

module.exports = {
    GetAllPayments: async function (page, limit, status, method) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const query = {};
        if (status) query.status = status;
        if (method) query.method = method;

        const payments = await PaymentModel.find(query)
            .populate('user', 'fullName email username')
            .populate('order', 'totalAmount status shippingAddress')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await PaymentModel.countDocuments(query);

        return {
            payments,
            total,
            page: page,
            totalPages: Math.ceil(total / limit)
        };
    },

    GetPaymentById: async function (paymentId) {
        return await PaymentModel.findById(paymentId)
            .populate('user', 'fullName email username phone')
            .populate('order');
    },

    GetPaymentsByUser: async function (userId, page, limit, status) {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const query = { user: userId };
        if (status) query.status = status;

        const payments = await PaymentModel.find(query)
            .populate('order', 'totalAmount status shippingAddress')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await PaymentModel.countDocuments(query);

        return {
            payments,
            total,
            page: page,
            totalPages: Math.ceil(total / limit)
        };
    },

    UpdatePaymentStatus: async function (paymentId, status) {
        const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            let error = new Error("Trạng thái không hợp lệ");
            error.status = 400;
            throw error;
        }

        const payment = await PaymentModel.findById(paymentId);
        if (!payment) {
            let error = new Error("Không tìm thấy thanh toán");
            error.status = 404;
            throw error;
        }

        payment.status = status;
        if (status === 'COMPLETED') {
            payment.paidAt = new Date();
        }
        await payment.save();

        return payment;
    },

    GetPaymentStats: async function () {
        const totalPayments = await PaymentModel.countDocuments();
        const completedPayments = await PaymentModel.countDocuments({ status: 'COMPLETED' });
        const pendingPayments = await PaymentModel.countDocuments({ status: 'PENDING' });
        const failedPayments = await PaymentModel.countDocuments({ status: 'FAILED' });

        const totalRevenue = await PaymentModel.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            totalPayments,
            completedPayments,
            pendingPayments,
            failedPayments,
            totalRevenue: totalRevenue[0]?.total || 0
        };
    }
};
