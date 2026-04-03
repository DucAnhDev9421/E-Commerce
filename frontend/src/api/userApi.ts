import axiosClient from './axiosClient';
import type { User } from '../types/auth';

const userApi = {
  getAll: (params?: any): Promise<User[]> => {
    return axiosClient.get('/users', { params });
  },
  getById: (id: string): Promise<User> => {
    return axiosClient.get(`/users/${id}`);
  },
  update: (id: string, data: any): Promise<User> => {
    return axiosClient.put(`/users/${id}`, data);
  },
  create: (data: any): Promise<User> => {
    return axiosClient.post('/users', data);
  },
  delete: (id: string) => {
    return axiosClient.delete(`/users/${id}`);
  },
  changePassword: (id: string, data: any): Promise<any> => {
    return axiosClient.put(`/users/${id}/change-password`, data);
  }
};

export default userApi;
