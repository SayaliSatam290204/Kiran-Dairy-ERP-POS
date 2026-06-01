import axiosInstance from './axiosInstance.js';

export const salesApi = {
  create: (data, config = {}) => axiosInstance.post('/sales', data, config),
  getAll: () => axiosInstance.get('/sales'),
  getById: (id) => axiosInstance.get(`/sales/${id}`),
  getHistory: () => axiosInstance.get('/sales/history'),
  addToInventory: (data) => axiosInstance.post('/sales/add-inventory', data)
};
