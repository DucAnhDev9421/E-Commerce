let express = require('express');
let router = express.Router();
let productController = require('../controllers/products');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Lấy danh sách sản phẩm (Công khai, hỗ trợ search và filter category qua query)
router.get('/', async function (req, res, next) {
    try {
        let result = await productController.GetAllProducts(req.query);
        res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy chi tiết sản phẩm (Công khai)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await productController.GetProductById(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm", data: null });
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết sản phẩm thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Tạo mới sản phẩm (Yêu cầu Admin)
router.post('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.CreateProduct(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo sản phẩm thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Cập nhật sản phẩm (Yêu cầu Admin)
router.put('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.UpdateProduct(req.params.id, req.body);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm để cập nhật", data: null });
        res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Xóa sản phẩm (Yêu cầu Admin)
router.delete('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.DeleteProduct(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm để xóa", data: null });
        res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công",
            data: null
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
