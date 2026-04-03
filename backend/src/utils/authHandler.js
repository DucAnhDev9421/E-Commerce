const jwt = require('jsonwebtoken');
let userController = require('../controllers/users');


/**
 * Middleware kiểm tra token đăng nhập
 */
let verifyToken = async function (req, res, next) {

    try {

        let authHeader = req.headers.authorization;

        // Kiểm tra header Authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                message: "Bạn chưa đăng nhập"
            });
        }

        // Lấy token
        let token = authHeader.split(" ")[1];

        // Giải mã token
        let decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        // Tìm user trong database
        let user = await userController.GetAnUserById(decoded.id);

        if (!user) {
            return res.status(401).send({
                message: "Người dùng không tồn tại"
            });
        }

        // Gắn user vào request
        req.user = user;

        next();

    } catch (error) {

        return res.status(401).send({
            message: "Phiên đăng nhập hết hạn"
        });

    }

};


/**
 * Middleware kiểm tra quyền
 */
let checkRole = function (...requiredRole) {

    return function (req, res, next) {

        if (
            req.user &&
            req.user.role &&
            req.user.role.name &&
            requiredRole.some(r => r.toUpperCase() === req.user.role.name.toUpperCase())
        ) {
            next();
        } else {
            return res.status(403).send({
                message: "Bạn không có quyền truy cập tính năng này"
            });
        }

    }

};

module.exports = {
    verifyToken,
    CheckLogin: verifyToken,
    checkRole,
    CheckRole: checkRole
};