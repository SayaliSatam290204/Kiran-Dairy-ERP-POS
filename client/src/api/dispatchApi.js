import axiosInstance from './axiosInstance.js';

export const dispatchApi = {
  create: (data) => axiosInstance.post('/api/dispatch', data),
  createBatch: (data) => axiosInstance.post('/api/dispatch', { ...data, isBatchDispatch: true }),
  getAll: () => axiosInstance.get('/api/dispatch'),
  getById: (id) => axiosInstance.get(`/api/dispatch/${id}`),
  getByShop: (shopId) => axiosInstance.get(`/api/dispatch/shop/${shopId}`),
  update: (id, data) => axiosInstance.put(`/api/dispatch/${id}`, data),
  updateStatus: (id, data) => axiosInstance.put(`/api/dispatch/${id}/status`, data),
  delete: (id) => axiosInstance.delete(`/api/dispatch/${id}`),
  getAnalytics: (filters = {}) => axiosInstance.get('/api/dispatch/analytics', { params: filters })
};
