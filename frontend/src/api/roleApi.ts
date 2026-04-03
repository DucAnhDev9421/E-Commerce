import axiosClient from './axiosClient';

const roleApi = {
  getAll: () => {
    return axiosClient.get('/roles');
  },
  getById: (id: string) => {
    return axiosClient.get(`/roles/${id}`);
  },
  create: (data: any) => {
    return axiosClient.post('/roles', data);
  },
  update: (id: string, data: any) => {
    return axiosClient.put(`/roles/${id}`, data);
  },
  delete: (id: string) => {
    return axiosClient.delete(`/roles/${id}`);
  }
};

export default roleApi;
