// client/src/api/staffPerformanceApi.js
import axiosInstance from './axiosInstance.js';

export const staffPerformanceApi = {
  // Get all staff performance (admin only)
  getAllStaffPerformance: () => 
    axiosInstance.get('/admin/staff-performance'),

  // Get individual staff detailed performance
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/admin/staff-performance/${staffId}`, {
      params: { year, month }
    }),

  // Get dashboard data which includes staff performance
  getAdminDashboard: () => 
    axiosInstance.get('/admin/dashboard'),

  getShopDashboard: () => 
    axiosInstance.get('/shop/dashboard')
};