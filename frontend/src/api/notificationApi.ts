import axiosClient from './axiosClient';

const notificationApi = {
    // Lấy thông báo của User đăng nhập
    getUserNotifications() {
        const url = `/notifications`;
        return axiosClient.get(url);
    },

    // Đánh dấu đã đọc
    markAsRead(notificationId: string) {
        const url = `/notifications/${notificationId}/read`;
        return axiosClient.put(url);
    }
};

export default notificationApi;
