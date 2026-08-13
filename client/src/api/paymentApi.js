import axiosInstance from "./axiosInstance.js";

export const paymentApi = {
  createOrder: (payload) => axiosInstance.post("/api/payment/orders", payload),
  verifyPayment: (payload) => axiosInstance.post("/api/payment/verify", payload),
};
