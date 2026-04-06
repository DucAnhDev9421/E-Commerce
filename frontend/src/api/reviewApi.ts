import axiosClient from './axiosClient';

const reviewApi = {
    // Lấy danh sách đánh giá của 1 sản phẩm
    getByProduct(productId: string) {
        const url = `/reviews/${productId}`;
        return axiosClient.get(url);
    },

    // Gửi đánh giá mới (yêu cầu gửi Authorization header ở axiosClient)
    create(productId: string, data: { rating: number, comment: string }) {
        const url = `/reviews/${productId}`;
        return axiosClient.post(url, data);
    }
};

export default reviewApi;
