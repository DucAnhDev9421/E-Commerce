const NotificationModel = require('../schemas/notifications');

module.exports = {
    GetUserNotifications: async function (userId) {
        return await NotificationModel
            .find({ userId: userId })
            .sort({ createdAt: -1 });
    },

    MarkAsRead: async function (notificationId, userId) {
        return await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId: userId },
            { isRead: true },
            { returnDocument: 'after' }
        );
    }
};
