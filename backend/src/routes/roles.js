let express = require('express');
let router = express.Router();

let roleController = require('../controllers/roles');
let { verifyToken, checkRole } = require('../utils/authHandler');


/**
 * Create role (Yêu cầu Admin)
 */
router.post('/', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await roleController.CreateRole(req.body);
        res.status(201).send(result);

    } catch (error) {

        let statusCode = error.code === 11000 ? 409 : 400;
        let message = error.code === 11000
            ? "Tên vai trò đã tồn tại"
            : error.message;

        res.status(statusCode).send({ message });
    }
});


/**
 * Get all roles (Yêu cầu Admin)
 */
router.get('/', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await roleController.GetAllRoles();
        res.send(result);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


/**
 * Get role theo id (Yêu cầu Admin)
 */
router.get('/:id', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await roleController.GetARoleById(req.params.id);

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy vai trò" });
        }

        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Update role (Yêu cầu Admin)
 */
router.put('/:id', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await roleController.UpdateARole(
            req.params.id,
            req.body
        );

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy vai trò để cập nhật" });
        }

        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Delete role (soft delete) (Yêu cầu Admin)
 */
router.delete('/:id', verifyToken, checkRole('ADMIN'), async function (req, res, next) {
    try {

        let result = await roleController.DeleteARole(req.params.id);

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy vai trò để xóa" });
        }

        res.send({ message: "Xóa thành công" });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


module.exports = router;