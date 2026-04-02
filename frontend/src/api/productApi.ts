import axiosClient from './axiosClient';

const productApi = {
  getAll: (params?: any) => {
    return axiosClient.get('/products', { params });
  },
  getById: (id: string) => {
    return axiosClient.get(`/products/${id}`);
  },
  create: (data: any) => {
    return axiosClient.post('/products', data);
  },
  update: (id: string, data: any) => {
    return axiosClient.put(`/products/${id}`, data);
  },
  delete: (id: string) => {
    return axiosClient.delete(`/products/${id}`);
  },
  uploadImage: (formData: FormData) => {
    return axiosClient.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default productApi;
