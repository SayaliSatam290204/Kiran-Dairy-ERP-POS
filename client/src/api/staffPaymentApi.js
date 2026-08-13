import axiosInstance from './axiosInstance.js';

export const staffPaymentApi = {
  // Get all payments
  getAllPayments: async (filters = {}) =>
    axiosInstance.get('/api/staff-payment', {
      params: {
        ...(filters.shopId ? { shopId: filters.shopId } : {}),
        ...(filters.staffId ? { staffId: filters.staffId } : {}),
        ...(filters.month ? { month: filters.month } : {}),
        ...(filters.status ? { status: filters.status } : {})
      }
    }),

  // Get single payment
  getPaymentById: async (id) => {
    return axiosInstance.get(`/api/staff-payment/${id}`);
  },

  // Create payment
  createPayment: async (data) => {
    return axiosInstance.post('/api/staff-payment', data);
  },

  // Update payment
  updatePayment: async (id, data) => {
    return axiosInstance.put(`/api/staff-payment/${id}`, data);
  },

  // Delete payment
  deletePayment: async (id) => {
    return axiosInstance.delete(`/api/staff-payment/${id}`);
  },

  // Get payment summary
  getPaymentSummary: async (filters = {}) =>
    axiosInstance.get('/api/staff-payment/summary', {
      params: {
        ...(filters.shopId ? { shopId: filters.shopId } : {}),
        ...(filters.year ? { year: filters.year } : {}),
        ...(filters.month ? { month: filters.month } : {})
      }
    }),

  // Get pending payments
  getPendingPayments: async (shopId = null) =>
    axiosInstance.get('/api/staff-payment/pending', {
      params: {
        ...(shopId ? { shopId } : {})
      }
    })
};
