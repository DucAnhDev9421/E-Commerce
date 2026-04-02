let express = require('express');
let router = express.Router();
let categoryController = require('../controllers/categories');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Lấy danh sách category (Công khai)
router.get('/', async function (req, res, next) {
    try {
        let result = await categoryController.GetAllCategories();
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Lấy chi tiết category (Công khai)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await categoryController.GetCategoryById(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy category" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Tạo mới category (Yêu cầu Admin)
router.post('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.CreateCategory(req.body);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Cập nhật category (Yêu cầu Admin)
router.put('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.UpdateCategory(req.params.id, req.body);
        if (!result) return res.status(404).send({ message: "Không tìm thấy category để cập nhật" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Xóa category (Yêu cầu Admin)
router.delete('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.DeleteCategory(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy category để xóa" });
        res.send({ message: "Xóa category thành công" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
