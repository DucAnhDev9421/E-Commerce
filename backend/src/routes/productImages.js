let express = require('express');
let router = express.Router();
let ProductImageController = require('../controllers/productImages');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// Tạo image mới (Yêu cầu Admin/Manager)
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        const { productId, imageUrl, isPrimary, altText } = req.body;

        let result = await ProductImageController.CreateProductImage(
            productId, imageUrl, isPrimary, altText
        );
        res.status(201).json({
            success: true,
            message: 'Image added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy tất cả images (Công khai)
router.get('/', async function (req, res, next) {
    try {
        let result = await ProductImageController.GetAllProductImages();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy images theo productId (Công khai)
router.get('/product/:productId', async function (req, res, next) {
    try {
        let result = await ProductImageController.GetProductImagesByProductId(req.params.productId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy image theo id (Công khai)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await ProductImageController.GetProductImageById(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Cập nhật image (Yêu cầu Admin/Manager)
router.patch('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        let result = await ProductImageController.UpdateProductImage(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Xóa image (Yêu cầu Admin/Manager)
router.delete('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res, next) {
    try {
        let result = await ProductImageController.DeleteProductImage(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
