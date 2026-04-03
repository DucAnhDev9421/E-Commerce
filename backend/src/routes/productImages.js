let express = require('express');
let router = express.Router();
let ProductImageController = require('../controllers/productImages');

router.post('/', async function (req, res, next) {
    try {
        let result = await ProductImageController.CreateProductImage(req.body);
        res.status(201).json({
            success: true,
            message: 'Image added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

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

router.patch('/:id', async function (req, res, next) {
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

router.delete('/:id', async function (req, res, next) {
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
