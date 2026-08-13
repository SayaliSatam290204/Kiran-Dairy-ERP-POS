import axiosInstance from './axiosInstance.js';

export const staffApi = {
  // Get all staff
  getAllStaff: async (shopId = null) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    
    return axiosInstance.get(`/api/staff?${params.toString()}`);
  },

  // Get staff by shop
  getStaffByShop: async (shopId) => {
    return axiosInstance.get(`/api/staff/shop/${shopId}`);
  },

  // Authorize staff for POS billing
  authorizeStaff: async (data) => {
    return axiosInstance.post('/api/staff/authorize', data);
  },

  // Get single staff
  getStaffById: async (id) => {
    return axiosInstance.get(`/api/staff/${id}`);
  },

  // Create staff
  createStaff: async (data) => {
    return axiosInstance.post('/api/staff', data);
  },

  // Update staff
  updateStaff: async (id, data) => {
    return axiosInstance.put(`/api/staff/${id}`, data);
  },

  // Delete staff
  deleteStaff: async (id) => {
    return axiosInstance.delete(`/api/staff/${id}`);
  }
};
