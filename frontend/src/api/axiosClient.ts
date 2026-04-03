import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout, setAccessToken } from '../store/authSlice';

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi Refresh Token từ Cookie
});

// Flag để kiểm tra xem có đang trong quá trình refresh token hay không
let isRefreshing = false;
// Queue các request bị lỗi 401 khi đang đợi refresh token
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Gắn Access Token vào Header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi 401 (Hết hạn Access Token)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data trực tiếp để tiện sử dụng
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Nếu lỗi 401 và không phải là request refresh-token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đẩy request hiện tại vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        // Fix: Đảm bảo format URL sạch sẽ (tránh double slash)
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
        const response: any = await axios.post(
          `${baseUrl}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        
        // Cập nhật token vào Redux Store
        store.dispatch(setAccessToken(accessToken));

        // Tiếp tục các request đang chờ trong queue
        processQueue(null, accessToken);

        // Thực hiện lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng thất bại (hết hạn hoàn toàn)
        processQueue(refreshError, null);
        
        // WORKAROUND: Nếu refresh thất bại, đẩy về Login
        store.dispatch(logout());
        window.location.href = '/login'; 
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
