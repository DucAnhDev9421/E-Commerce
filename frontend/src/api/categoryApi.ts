import axiosClient from './axiosClient';

const categoryApi = {
  getAll: () => {
    return axiosClient.get('/categories');
  },
  getById: (id: string) => {
    return axiosClient.get(`/categories/${id}`);
  },
  create: (data: any) => {
    return axiosClient.post('/categories', data);
  },
  update: (id: string, data: any) => {
    return axiosClient.put(`/categories/${id}`, data);
  },
  delete: (id: string) => {
    return axiosClient.delete(`/categories/${id}`);
  }
};

export default categoryApi;
