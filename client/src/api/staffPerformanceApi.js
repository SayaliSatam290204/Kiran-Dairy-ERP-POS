// client/src/api/staffPerformanceApi.js
import axiosInstance from './axiosInstance.js';

export const staffPerformanceApi = {
  // Get all staff performance (admin only)
  getAllStaffPerformance: () => 
    axiosInstance.get('/api/admin/staff-performance'),

  // Get individual staff detailed performance
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/api/shop/staff-performance/${staffId}`, {
      params: { year, month }
    }),

  // Get dashboard data which includes staff performance
  getAdminDashboard: () => 
    axiosInstance.get('/api/admin/dashboard'),

  getShopDashboard: () => 
    axiosInstance.get('/api/shop/dashboard')
};