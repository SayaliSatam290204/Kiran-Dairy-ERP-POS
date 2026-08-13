// client/src/api/authApi.js
import axiosInstance from "./axiosInstance.js";

export const authApi = {
  login: (payload) => axiosInstance.post("/api/auth/login", payload),
  registerAdmin: (payload) => axiosInstance.post("/api/auth/admin/register", payload),
  registerSuperAdmin: (payload) => axiosInstance.post("/api/auth/super-admin/register", payload),
  adminExists: () => axiosInstance.get("/api/auth/admin/exists"),
  // ✅ Add this line:
  changePassword: (payload) => axiosInstance.post("/api/auth/change-password", payload),
};

