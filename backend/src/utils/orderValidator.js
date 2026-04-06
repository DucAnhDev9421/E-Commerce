const { body, param, validationResult } = require('express-validator');

const VALID_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const VALID_PAYMENT_METHODS = ['COD', 'VNPAY'];

/**
 * Middleware xử lý kết quả validation - trả về lỗi nếu có
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: false,
            message: "Dữ liệu đầu vào không hợp lệ",
            error: {
                code: "VALIDATION_ERROR",
                details: errors.array().map(e => ({
                    field: e.path,
                    message: e.msg
                }))
            }
        });
    }
    next();
};

/**
 * Validation cho route POST /checkout
 * - addressId: bắt buộc, phải là ObjectId hợp lệ
 * - paymentMethod: bắt buộc, phải là 'COD' hoặc 'VNPAY'
 * - note: optional string, max 500 chars
 */
const validateCheckout = [
    body('addressId')
        .trim()
        .notEmpty()
        .withMessage("Vui lòng chọn địa chỉ giao hàng")
        .isMongoId()
        .withMessage("Địa chỉ giao hàng không hợp lệ"),
    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage("Phương thức thanh toán không được để trống")
        .isIn(VALID_PAYMENT_METHODS)
        .withMessage(`Phương thức thanh toán phải là một trong: ${VALID_PAYMENT_METHODS.join(', ')}`),
    body('note')
        .optional()
        .isString()
        .withMessage("Ghi chú phải là chuỗi ký tự")
        .isLength({ max: 500 })
        .withMessage("Ghi chú không được vượt quá 500 ký tự"),
    handleValidationErrors
];

/**
 * Validation cho route PATCH /:id/status
 * - status: bắt buộc, phải là trạng thái hợp lệ
 */
const validateUpdateStatus = [
    param('id')
        .isMongoId()
        .withMessage("ID đơn hàng không hợp lệ"),
    body('status')
        .trim()
        .notEmpty()
        .withMessage("Trạng thái không được để trống")
        .isIn(VALID_ORDER_STATUSES)
        .withMessage(`Trạng thái phải là một trong: ${VALID_ORDER_STATUSES.join(', ')}`),
    handleValidationErrors
];

/**
 * Validation cho route PATCH /:id/cancel
 * - orderId: phải là MongoDB ObjectId hợp lệ
 */
const validateCancelOrder = [
    param('id')
        .isMongoId()
        .withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors
];

/**
 * Validation cho route GET /:id
 * - orderId: phải là MongoDB ObjectId hợp lệ
 */
const validateGetOrderById = [
    param('id')
        .isMongoId()
        .withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors
];

module.exports = {
    validateCheckout,
    validateUpdateStatus,
    validateCancelOrder,
    validateGetOrderById,
    VALID_ORDER_STATUSES,
    VALID_PAYMENT_METHODS
};
