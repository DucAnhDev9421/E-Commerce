const rateLimit = require('express-rate-limit');

/**
 * Tạo key cho rate limiter: ưu tiên userId, fallback về IP đã normalize
 */
const makeKeyGenerator = (req) => {
    if (req.user?._id) {
        return req.user._id.toString();
    }
    return rateLimit.ipKeyGenerator(req, undefined);
};

/**
 * Rate limiter cho route checkout - chống spam double-click
 * Giới hạn: 1 request mỗi 15 giây cho mỗi user
 */
const checkoutRateLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: makeKeyGenerator,
    handler: (req, res) => {
        return res.status(429).send({
            success: false,
            message: "Bạn đã đặt hàng quá nhanh. Vui lòng chờ 15 giây trước khi thử lại.",
            error: {
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: 15
            }
        });
    },
    skip: (req) => {
        return req.path === '/vnpay-return';
    }
});

/**
 * Rate limiter tổng cho toàn bộ API orders
 * Giới hạn: 20 requests/phút cho mỗi user/IP
 */
const ordersApiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: makeKeyGenerator,
    handler: (req, res) => {
        return res.status(429).send({
            success: false,
            message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
            error: {
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: 60
            }
        });
    }
});

/**
 * Rate limiter cho admin routes - ít nghiêm ngặt hơn
 * Vì admin có thể cần thao tác nhiều
 */
const adminOrdersRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: makeKeyGenerator,
    handler: (req, res) => {
        return res.status(429).send({
            success: false,
            message: "Quá nhiều yêu cầu quản lý. Vui lòng thử lại sau.",
            error: {
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: 60
            }
        });
    }
});

module.exports = {
    checkoutRateLimiter,
    ordersApiRateLimiter,
    adminOrdersRateLimiter
};