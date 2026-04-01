let express = require('express');
let router = express.Router();
let userController = require('../controllers/users');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Route lấy danh sách: Yêu cầu đăng nhập và là admin
router.get('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await userController.GetAllUsers();
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Route lấy chi tiết: Chỉ yêu cầu đăng nhập
router.get('/:id', CheckLogin, async function (req, res, next) {
    try {
        let result = await userController.GetAnUserById(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy user" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.post('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await userController.CreateAnUser(req.body);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.put('/:id', CheckLogin, async function (req, res, next) {
    try {
        let result = await userController.UpdateAnUser(req.params.id, req.body);
        if (!result) return res.status(404).send({ message: "Không tìm thấy user để update" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.delete('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await userController.DeleteAnUser(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy user để xóa" });
        res.send({ message: "Xóa User thành công (soft delete)" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
