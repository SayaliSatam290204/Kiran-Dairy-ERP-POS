import axiosInstance from "./axiosInstance.js";

export const returnApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.shopId) params.append("shopId", filters.shopId);
    if (filters.status) params.append("status", filters.status);
    return axiosInstance.get(`/api/return?${params.toString()}`);
  },

  getById: (id) => axiosInstance.get(`/api/return/${id}`),

  create: (data) => axiosInstance.post("/api/return", data),

  updateStatus: (id, payload) => axiosInstance.put(`/api/return/${id}/status`, payload),

  deleteReturn: (id) => axiosInstance.delete(`/api/return/${id}`),

  getByStatus: (status) => axiosInstance.get("/api/return", { params: { status } }),

  // Admin notification: pending returns count
  getPendingCount: () => axiosInstance.get("/api/return/pending/count")
};