import axiosInstance from './axiosInstance.js';

export const ledgerApi = {
  getAll: () => axiosInstance.get('/api/ledger'),
  getByShop: (shopId) => axiosInstance.get(`/api/ledger/shop/${shopId}`),
  getByProduct: (productId) => axiosInstance.get(`/api/ledger/product/${productId}`),
  getByDateRange: (startDate, endDate) => 
    axiosInstance.get('/api/ledger', { params: { startDate, endDate } })
};
