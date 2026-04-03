let express = require('express');
let router = express.Router();
let categoryController = require('../controllers/categories');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Lấy danh sách category (Công khai)
router.get('/', async function (req, res, next) {
    try {
        let result = await categoryController.GetAllCategories();
        res.status(200).json({
            success: true,
            message: "Lấy danh sách category thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy chi tiết category (Công khai)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await categoryController.GetCategoryById(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy category", data: null });
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết category thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Tạo mới category (Yêu cầu Admin)
router.post('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.CreateCategory(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo category thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Cập nhật category (Yêu cầu Admin)
router.put('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.UpdateCategory(req.params.id, req.body);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy category để cập nhật", data: null });
        res.status(200).json({
            success: true,
            message: "Cập nhật category thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Xóa category (Yêu cầu Admin)
router.delete('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await categoryController.DeleteCategory(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy category để xóa", data: null });
        res.status(200).json({
            success: true,
            message: "Xóa category thành công",
            data: null
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
