const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');
const { verifyToken } = require('../utils/authHandler');


router.get('/', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notifications = await notificationController.GetUserNotifications(userId);
        
        return res.status(200).json({
            success: true,
            message: "Lấy thông báo thành công",
            data: notifications
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id/read', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.id;

        const result = await notificationController.MarkAsRead(notificationId, userId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông báo hoặc bạn không có quyền sửa"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đã đánh dấu báo là đã xem",
            data: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
