let express = require('express');
let router = express.Router();

let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

let authController = require('../controllers/auth');


/**
 * Helper xử lý lỗi
 * Bắt lỗi MongoDB duplicate key (11000)
 */
const sendError = (res, error) => {
    let status = error.status || 400;
    let message = error.message;

    if (error.code === 11000) {
        status = 409;
        message = "Email hoặc tên đăng nhập đã được sử dụng";
    }

    res.status(status).send({ message: message });
};


/**
 * Register user
 * Dùng transaction để tạo user + address mặc định
 */
router.post('/register', async function (req, res, next) {

    let session = await mongoose.startSession();
    session.startTransaction();

    try {

        let result = await authController.RegisterUser(req.body, session);

        await session.commitTransaction();
        session.endSession();

        res.status(201).send({
            success: true,
            data: result
        });

    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        sendError(res, error);
    }
});


/**
 * Login user
 * - Kiểm tra username
 * - Kiểm tra password
 * - Lock account nếu sai 3 lần
 * - Trả về accessToken + refreshToken
 */
router.post('/login', async function (req, res, next) {

    try {

        let { username, password } = req.body;

        let user = await authController.LoginUser(username);

        if (user) {
            await user.populate('role');
        }

        if (!user) {
            return res.status(404).send({ message: "Tài khoản không tồn tại" });
        }

        if (user.lockTime && user.lockTime > Date.now()) {
            return res.status(423).send({ message: "Tài khoản đang bị khóa" });
        }

        if (!bcrypt.compareSync(password, user.password)) {

            user.loginCount += 1;

            if (user.loginCount >= 3) {
                user.lockTime = Date.now() + 3600000;
                user.loginCount = 0;
            }

            await authController.UpdateLoginStatus(user);

            return res.status(401).send({ message: "Mật khẩu không chính xác" });
        }

        user.loginCount = 0;
        user.lockTime = null;

        await authController.UpdateLoginStatus(user);

        let accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        let refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        await authController.UpdateRefreshToken(user._id, refreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.send({
            success: true,
            data: {
                user: user,
                accessToken: accessToken
            }
        });

    } catch (error) {
        sendError(res, error);
    }
});


/**
 * Refresh access token
 */
router.post('/refresh-token', async function (req, res, next) {

    try {

        let refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).send({ message: "Phiên đăng nhập hết hạn" });
        }

        let decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        let UserModel = require('../schemas/users');
        let userDB = await UserModel.findById(decoded.id);

        if (!userDB || userDB.refreshToken !== refreshToken) {
            return res.status(403).send({ message: "Phiên làm việc không hợp lệ" });
        }

        let newAccessToken = jwt.sign(
            { id: userDB._id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        res.send({
            success: true,
            data: { accessToken: newAccessToken }
        });

    } catch (error) {
        res.status(401).send({ message: "Phiên đăng nhập hết hạn" });
    }
});


/**
 * Logout user
 * Xóa refresh token khỏi database
 */
router.post('/logout', async function (req, res, next) {

    try {

        let refreshToken = req.cookies.refreshToken;

        let UserModel = require('../schemas/users');

        await UserModel.findOneAndUpdate(
            { refreshToken: refreshToken },
            { refreshToken: "" }
        );

        res.clearCookie('refreshToken');

        res.send({ message: "Đăng xuất thành công" });

    } catch (error) {
        sendError(res, error);
    }
});


module.exports = router;