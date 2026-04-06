const NotificationModel = require('../schemas/notifications');


let GetUserNotifications = async function (userId) {
    return await NotificationModel
        .find({ userId: userId })
        .sort({ createdAt: -1 });
};


let MarkAsRead = async function (notificationId, userId) {
    return await NotificationModel.findOneAndUpdate(
        { _id: notificationId, userId: userId },
        { isRead: true },
        { new: true }
    );
};

module.exports = {
    GetUserNotifications,
    MarkAsRead
};
