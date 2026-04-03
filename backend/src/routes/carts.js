const express = require('express');
const router = express.Router();
const cartController = require('../controllers/carts');
const { CheckLogin } = require('../utils/authHandler');

// Lấy giỏ hàng
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let result = await cartController.GetCartByUserId(req.user._id);
        res.status(200).json({ success: true, message: "Lấy giỏ hàng thành công", data: result });
    } catch (error) {
        next(error);
    }
});

// Thêm sản phẩm vào giỏ
router.post('/items', CheckLogin, async function (req, res, next) {
    try {
        const { productId, quantity } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: "Thiếu productId", data: null });
        
        let result = await cartController.AddItemToCart(req.user._id, productId, quantity || 1);
        res.status(200).json({ success: true, message: "Thêm vào giỏ hàng thành công", data: result });
    } catch (error) {
        next(error);
    }
});

// Cập nhật số lượng
router.patch('/items/:productId', CheckLogin, async function (req, res, next) {
    try {
        const { quantity } = req.body;
        if (quantity < 1) return res.status(400).json({ success: false, message: "Số lượng không hợp lệ", data: null });

        let result = await cartController.UpdateItemQuantity(req.user._id, req.params.productId, quantity);
        res.status(200).json({ success: true, message: "Cập nhật số lượng thành công", data: result });
    } catch (error) {
        next(error);
    }
});

// Xóa sản phẩm khỏi giỏ
router.delete('/items/:productId', CheckLogin, async function (req, res, next) {
    try {
        let result = await cartController.RemoveItemFromCart(req.user._id, req.params.productId);
        res.status(200).json({ success: true, message: "Xóa khỏi giỏ hàng thành công", data: result });
    } catch (error) {
        next(error);
    }
});

// Xóa toàn bộ giỏ hàng
router.delete('/clear', CheckLogin, async function (req, res, next) {
    try {
        let result = await cartController.ClearCart(req.user._id);
        res.status(200).json({ success: true, message: "Đã xóa toàn bộ giỏ hàng", data: result });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
