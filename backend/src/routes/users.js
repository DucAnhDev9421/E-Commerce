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
        res.send(result);

    } catch (error) {
        console.log("LỖI TẠI ROUTE GET USERS:", error);
        res.status(500).send({ message: error.message });
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
            return res.status(404).send({ message: "Không tìm thấy user" });
        }

        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Create user
 * Chỉ ADMIN được tạo
 */
router.post('/', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await userController.CreateAnUser(req.body);
        res.status(201).send(result);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({ message: "Email hoặc tên đăng nhập đã tồn tại" });
        }

        res.status(400).send({ message: error.message });
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
            return res.status(404).send({ message: "Không tìm thấy user để xóa" });
        }

        res.send({ message: "Xóa User thành công (soft delete)" });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Change password
 */
router.put('/:id/change-password', verifyToken, async function (req, res) {
    try {

        const { oldPassword, newPassword } = req.body;

        await userController.ChangePassword(
            req.params.id,
            oldPassword,
            newPassword
        );

        res.send({
            success: true,
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        res.status(400).send({ message: error.message });
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
        return res.status(403).send({
            message: "Bạn không có quyền sửa thông tin người khác"
        });
    }

    try {

        let result = await userController.UpdateAnUser(
            req.params.id,
            req.body
        );

        res.send(result);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({
                message: "Email hoặc tên đăng nhập đã tồn tại"
            });
        }

        res.status(400).send({ message: error.message });
    }
});


module.exports = router;