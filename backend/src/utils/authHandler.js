let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');

let CheckLogin = async function (req, res, next) {
    try {
        let token = "";
        // 1. Kiểm tra Bearer token trong Headers trước
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } 
        // 2. Sau đó mới tìm trong Cookie nếu không có Header
        else if (req.cookies && req.cookies.TOKEN_LOGIN_NNPTUD_C4) {
            token = req.cookies.TOKEN_LOGIN_NNPTUD_C4;
        }

        if (!token) {
            return res.status(404).send({ message: "Bạn chưa đăng nhập" });
        }

        // 3. Giải mã JWT và kiểm tra thời hạn
        let decoded = jwt.verify(token, 'SECRET_KEY_NNPTUD_C4');
        
        // 4. Lấy thông tin user (dùng hàm từ controller có populate role)
        let user = await userController.GetAnUserById(decoded.id);
        if (!user) {
            return res.status(404).send({ message: "Người dùng không tồn tại hoặc đã bị khóa" });
        }

        // Gán user vào request để dùng ở các route sau
        req.user = user;
        next();
    } catch (error) {
        return res.status(404).send({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
}

// Kiểm tra quyền (phải dùng tham số mảng cho tính linh hoạt)
let CheckRole = function (...requiredRole) {
    return function (req, res, next) {
        // Kiểm tra xem name của role có nằm trong mảng requiredRole không
        if (req.user && req.user.role && requiredRole.includes(req.user.role.name)) {
            next();
        } else {
            return res.status(403).send({ message: "Bạn không có quyền truy cập" });
        }
    }
}

module.exports = {
    CheckLogin,
    CheckRole
};
