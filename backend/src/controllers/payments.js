let PaymentModel = require('../schemas/payments');
let OrderModel = require('../schemas/orders');

let getAllPayments = async function (req, res) {
    try {
        const { page = 1, limit = 10, status, method } = req.query;

        const query = {};
        if (status) query.status = status;
        if (method) query.method = method;

        const payments = await PaymentModel.find(query)
            .populate('user', 'fullName email username')
            .populate('order', 'totalAmount status shippingAddress')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await PaymentModel.countDocuments(query);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách thanh toán thành công",
            data: {
                payments,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách thanh toán thất bại",
            error: { code: "FETCH_PAYMENTS_FAILED", details: error.message }
        });
    }
};

let getPaymentById = async function (req, res) {
    try {
        const paymentId = req.params.id;

        const payment = await PaymentModel.findById(paymentId)
            .populate('user', 'fullName email username phone')
            .populate('order');

        if (!payment) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy thanh toán",
                error: { code: "PAYMENT_NOT_FOUND" }
            });
        }

        return res.status(200).send({
            success: true,
            message: "Lấy chi tiết thanh toán thành công",
            data: payment
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy chi tiết thanh toán thất bại",
            error: { code: "FETCH_PAYMENT_FAILED", details: error.message }
        });
    }
};

let getPaymentsByUser = async function (req, res) {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { user: userId };
        if (status) query.status = status;

        const payments = await PaymentModel.find(query)
            .populate('order', 'totalAmount status shippingAddress')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await PaymentModel.countDocuments(query);

        return res.status(200).send({
            success: true,
            message: "Lấy danh sách thanh toán thành công",
            data: {
                payments,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy danh sách thanh toán thất bại",
            error: { code: "FETCH_PAYMENTS_FAILED", details: error.message }
        });
    }
};

let updatePaymentStatus = async function (req, res) {
    try {
        const paymentId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send({
                success: false,
                message: "Trạng thái không hợp lệ",
                error: { code: "INVALID_STATUS" }
            });
        }

        const payment = await PaymentModel.findById(paymentId);
        if (!payment) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy thanh toán",
                error: { code: "PAYMENT_NOT_FOUND" }
            });
        }

        payment.status = status;
        if (status === 'COMPLETED') {
            payment.paidAt = new Date();
        }
        await payment.save();

        return res.status(200).send({
            success: true,
            message: "Cập nhật trạng thái thanh toán thành công",
            data: payment
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Cập nhật trạng thái thanh toán thất bại",
            error: { code: "UPDATE_PAYMENT_FAILED", details: error.message }
        });
    }
};

let getPaymentStats = async function (req, res) {
    try {
        const totalPayments = await PaymentModel.countDocuments();
        const completedPayments = await PaymentModel.countDocuments({ status: 'COMPLETED' });
        const pendingPayments = await PaymentModel.countDocuments({ status: 'PENDING' });
        const failedPayments = await PaymentModel.countDocuments({ status: 'FAILED' });

        const totalRevenue = await PaymentModel.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return res.status(200).send({
            success: true,
            message: "Lấy thống kê thanh toán thành công",
            data: {
                totalPayments,
                completedPayments,
                pendingPayments,
                failedPayments,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Lấy thống kê thanh toán thất bại",
            error: { code: "FETCH_STATS_FAILED", details: error.message }
        });
    }
};

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentsByUser,
    updatePaymentStatus,
    getPaymentStats
};
