let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let authController = require('../controllers/auth');

router.post('/register', async function (req, res, next) {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        let result = await authController.RegisterUser(req.body, session);
        await session.commitTransaction();
        session.endSession();
        res.send(result);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).send({ message: error.message });
    }
});

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await authController.LoginUser(username);
        if (user) {
            await user.populate('role');
        }

        
        if (!user) return res.status(404).send({ message: "Tài khoản không tồn tại" });
        if (user.lockTime && user.lockTime > Date.now()) {
            return res.status(404).send({ message: "Tài khoản đang bị khóa" });
        }
        
        if (!bcrypt.compareSync(password, user.password)) {
            user.loginCount += 1;
            if (user.loginCount >= 3) { user.lockTime = Date.now() + 3600000; user.loginCount = 0; }
            await authController.UpdateLoginStatus(user);
            return res.status(404).send({ message: "Mật khẩu không chính xác" });
        }
        
        user.loginCount = 0;
        user.lockTime = null;
        await authController.UpdateLoginStatus(user);
        
        // 1. Tạo AccessToken (15m) và RefreshToken (7d)
        let accessToken = jwt.sign({ id: user._id }, 'ACCESS_TOKEN_SECRET', { expiresIn: '15m' });
        let refreshToken = jwt.sign({ id: user._id }, 'REFRESH_TOKEN_SECRET', { expiresIn: '7d' });
        
        // 2. Lưu RefreshToken vào DB qua Controller
        await authController.UpdateRefreshToken(user._id, refreshToken);
        
        // 3. Gắn RefreshToken vào HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        
        res.send({ user: user, accessToken: accessToken });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.post('/refresh-token', async function (req, res, next) {
    try {
        let refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(403).send({ message: "Hợp lệ" });

        // Giải mã Refresh Token
        let decoded = jwt.verify(refreshToken, 'REFRESH_TOKEN_SECRET');
        
        // Tìm user và kiểm tra token trong DB có khớp không
        let UserModel = require('../schemas/users');
        let userDB = await UserModel.findById(decoded.id);
        
        if (!userDB || userDB.refreshToken !== refreshToken) {
            return res.status(403).send({ message: "Refresh Token không hợp lệ" });
        }

        // Tạo AccessToken mới
        let newAccessToken = jwt.sign({ id: userDB._id }, 'ACCESS_TOKEN_SECRET', { expiresIn: '15m' });
        res.send({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).send({ message: "Phiên đăng nhập hết hạn" });
    }
});

router.post('/logout', async function (req, res, next) {
    try {
        let refreshToken = req.cookies.refreshToken;
        let UserModel = require('../schemas/users');
        // Xóa token trong DB
        await UserModel.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: "" });
        
        res.clearCookie('refreshToken');
        res.send({ message: "Đăng xuất thành công" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
