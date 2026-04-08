let express = require('express');
let router = express.Router();

let userController = require('../controllers/users');
let { verifyToken, checkRole } = require('../utils/authHandler');


/**
 * Get all users
 * Yêu cầu đăng nhập + quyền ADMIN
 */
router.get('/', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await userController.GetAllUsers();
        res.status(200).json({ success: true, message: "Lấy danh sách user thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Get user theo id
 * Chỉ yêu cầu đăng nhập
 */
router.get('/:id', verifyToken, async function (req, res, next) {
    try {

        let result = await userController.GetAnUserById(req.params.id);

        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user", data: null });
        }

        res.status(200).json({ success: true, message: "Lấy chi tiết user thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Create user
 * Chỉ ADMIN được tạo
 */
router.post('/', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        const { username, password, email, role, fullName, phone, avatarUrl } = req.body;

        let result = await userController.CreateAnUser(
            username, password, email, role, fullName, phone, avatarUrl
        );
        res.status(201).json({ success: true, message: "Tạo user thành công", data: result });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Email hoặc tên đăng nhập đã tồn tại", data: null });
        }
        next(error);
    }
});


/**
 * Soft delete user
 * Chỉ ADMIN được xóa
 */
router.delete('/:id', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await userController.DeleteAnUser(req.params.id);

        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy user để xóa", data: null });
        }

        res.status(200).json({ success: true, message: "Xóa User thành công (soft delete)", data: null });

    } catch (error) {
        next(error);
    }
});


/**
 * Change password
 */
router.put('/:id/change-password', verifyToken, async function (req, res, next) {
    try {

        const { oldPassword, newPassword } = req.body;

        await userController.ChangePassword(
            req.params.id,
            oldPassword,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công",
            data: null
        });

    } catch (error) {
        next(error);
    }
});


/**
 * Update user
 * - ADMIN có thể sửa tất cả
 * - User chỉ sửa được chính mình
 */
router.put('/:id', verifyToken, async function (req, res, next) {

    const roleName = req.user?.role?.name || '';

    if (
        roleName !== 'ADMIN' &&
        req.user?._id?.toString() !== req.params.id
    ) {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền sửa thông tin người khác",
            data: null
        });
    }

    try {
        let result = await userController.UpdateAnUser(
            req.params.id,
            req.body
        );

        res.status(200).json({ success: true, message: "Cập nhật user thành công", data: result });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email hoặc tên đăng nhập đã tồn tại",
                data: null
            });
        }
        next(error);
    }
});


module.exports = router;