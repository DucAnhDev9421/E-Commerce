import axiosClient from './axiosClient';
import type { User } from '../types/auth';

const authApi = {
  register: (data: any) => {
    return axiosClient.post('/auth/register', data);
  },
  login: (data: any) => {
    return axiosClient.post('/auth/login', data);
  },
  logout: () => {
    return axiosClient.post('/auth/logout');
  },
  refreshToken: () => {
    return axiosClient.post('/auth/refresh-token');
  }
};

export default authApi;
