let express = require('express');
let router = express.Router();
let productController = require('../controllers/products');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Lấy danh sách sản phẩm (Công khai, hỗ trợ search và filter category qua query)
router.get('/', async function (req, res, next) {
    try {
        let result = await productController.GetAllProducts(req.query);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Lấy chi tiết sản phẩm (Công khai)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await productController.GetProductById(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy sản phẩm" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Tạo mới sản phẩm (Yêu cầu Admin)
router.post('/', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.CreateProduct(req.body);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Cập nhật sản phẩm (Yêu cầu Admin)
router.put('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.UpdateProduct(req.params.id, req.body);
        if (!result) return res.status(404).send({ message: "Không tìm thấy sản phẩm để cập nhật" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Xóa sản phẩm (Yêu cầu Admin)
router.delete('/:id', CheckLogin, CheckRole('admin'), async function (req, res, next) {
    try {
        let result = await productController.DeleteProduct(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy sản phẩm để xóa" });
        res.send({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
