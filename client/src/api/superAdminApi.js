import axiosInstance from "./axiosInstance";

export const superAdminApi = {
  // Get comprehensive dashboard
  getDashboard: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.days) params.append("days", filters.days);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    
    if (filters.selectedBranches && Array.isArray(filters.selectedBranches)) {
      params.append("selectedBranches", JSON.stringify(filters.selectedBranches));
    }

    const queryString = params.toString();
    const url = `/super-admin/dashboard${queryString ? "?" + queryString : ""}`;

    return await axiosInstance.get(url);
  },

  // Get detailed branch report
  getBranchReport: async (shopId) => {
    return await axiosInstance.get(`/super-admin/branch/${shopId}/report`);
  },

  // Get revenue trends
  getRevenueTrends: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return await axiosInstance.get("/super-admin/revenue-trends", { params });
  }
};