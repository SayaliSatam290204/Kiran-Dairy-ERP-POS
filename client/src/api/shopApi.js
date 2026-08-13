import axiosInstance from './axiosInstance.js';

export const shopApi = {

  getDashboard: () => axiosInstance.get('/api/shop/dashboard'),
  getInventory: () => axiosInstance.get('/api/shop/inventory'),
  getReceivedDispatches: () => axiosInstance.get('/api/shop/received-dispatches'),
  getReceivedStock: () => axiosInstance.get('/api/shop/received-dispatches'), // Alias
  getSalesHistory: () => axiosInstance.get('/api/sales/history'),
  addToInventory: (data) => axiosInstance.post('/api/sales/add-inventory', data),
  getStaffPerformance: (period = 'monthly', year, month, date) =>
    axiosInstance.get('/api/shop/staff-performance', { 
      params: { period, year, month, date } 
    }),
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/api/shop/staff-performance/${staffId}`, {
      params: { year, month }
    }),
  // Restock Requests (shop submits to admin)
  createRestockRequest: (data) => axiosInstance.post('/api/ledger/restock-requests', data),
  getPreviewData: () => axiosInstance.get('/api/shop/preview'), // Landing page charts
  
  postDiscrepancy: (dispatchId, items) => axiosInstance.post('/api/dispatch/discrepancy', { dispatchId, items }),
  getPendingDiscrepancies: () => axiosInstance.get('/api/dispatch/discrepancies/pending'),
  resolveDiscrepancy: (id, data) => axiosInstance.patch(`/api/dispatch/discrepancy/${id}/resolve`, data)
};







