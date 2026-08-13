import axiosInstance from './axiosInstance.js';

export const salesApi = {
  create: (data, config = {}) => axiosInstance.post('/api/sales', data, config),
  getAll: () => axiosInstance.get('/api/sales'),
  getById: (id) => axiosInstance.get(`/api/sales/${id}`),
  getHistory: () => axiosInstance.get('/api/sales/history'),
  addToInventory: (data) => axiosInstance.post('/api/sales/add-inventory', data)
};
