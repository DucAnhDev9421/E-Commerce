import axiosClient from './axiosClient';

const userApi = {
  getAll: (params?: any) => {
    return axiosClient.get('/users', { params });
  },
  getById: (id: string) => {
    return axiosClient.get(`/users/${id}`);
  },
  create: (data: any) => {
    return axiosClient.post('/users', data);
  },
  update: (id: string, data: any) => {
    return axiosClient.put(`/users/${id}`, data);
  },
  delete: (id: string) => {
    return axiosClient.delete(`/users/${id}`);
  }
};

export default userApi;
