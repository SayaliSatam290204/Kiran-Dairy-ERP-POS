// client/src/api/authApi.js
import axiosInstance from "./axiosInstance.js";

export const authApi = {
  login: (payload) => axiosInstance.post("/auth/login", payload),
  register: (payload) => axiosInstance.post("/auth/register", payload),
  registerAdmin: (payload) => axiosInstance.post("/auth/admin/register", payload),
  adminExists: () => axiosInstance.get("/auth/admin/exists"),
  // ✅ Add this line:
  changePassword: (payload) => axiosInstance.post("/auth/change-password", payload),
};

