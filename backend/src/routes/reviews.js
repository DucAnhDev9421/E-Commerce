const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const reviewController = require('../controllers/reviews');
const ProductModel = require('../schemas/products');
const NotificationModel = require('../schemas/notifications');
const UserModel = require('../schemas/users'); 

const socketConfig = require('../utils/socket');
const { verifyToken } = require('../utils/authHandler');


router.get('/:productId', async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const reviews = await reviewController.GetProductReviews(productId);
        
        return res.status(200).json({
            success: true,
            message: "Lấy thống kê đánh giá thành công",
            data: reviews
        });
    } catch (error) {
        next(error);
    }
});


router.post('/:productId', verifyToken, async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const productId = req.params.productId;
        const userId = req.user._id;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Điểm đánh giá phải từ 1 đến 5" });
        }

        const objProductId = new mongoose.Types.ObjectId(productId);
        await reviewController.CreateReview(userId, objProductId, rating, comment, session);

        const stats = await reviewController.CalculateProductRating(objProductId, session);

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { rating: stats.rating, numReviews: stats.numReviews },
            { new: true, session }
        );

        if (!updatedProduct) {
             throw new Error("Không tim thấy sản phẩm để cập nhật");
        }

        const RoleModel = require('../schemas/roles');
        const adminRole = await RoleModel.findOne({ name: 'ADMIN' });
        
        let newNotification = null;
        if (adminRole) {
            const adminUser = await UserModel.findOne({ role: adminRole._id });
            if (adminUser) {
                newNotification = new NotificationModel({
                    userId: adminUser._id,
                    title: "Có thông báo đánh giá mới",
                    message: `Sản phẩm '${updatedProduct.name}' vừa nhận được đánh giá ${rating} sao.`,
                    type: "REVIEW"
                });
                await newNotification.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        if (newNotification) {
            try {
                const io = socketConfig.getIO();
                io.emit('NEW_NOTIFICATION', {
                    to: newNotification.userId,
                    title: newNotification.title,
                    message: newNotification.message
                });
            } catch (socketErr) {
                 console.log("Socket emit error (ignored):", socketErr.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Gửi Đánh giá thành công",
            data: { rating: stats.rating, numReviews: stats.numReviews }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});

module.exports = router;
