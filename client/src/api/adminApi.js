import axiosInstance from './axiosInstance.js';

export const adminApi = {
  getDashboard: () => axiosInstance.get('/api/admin/dashboard'),
  getShops: () => axiosInstance.get('/api/admin/shops'),
  getAllShops: () => axiosInstance.get('/api/admin/all-shops'),
  createShop: (data) => axiosInstance.post('/api/admin/shops', data),
  updateShop: (id, data) => axiosInstance.put(`/api/admin/shops/${id}`, data),
  deleteShop: (id) => axiosInstance.delete(`/api/admin/shops/${id}`),
  getProducts: () => axiosInstance.get('/api/admin/products'),
  getStaffPerformance: () => axiosInstance.get('/api/admin/staff-performance'),

  // ✅ NEW: Shop Ledger & Inventory Management
  getShopsWithInventory: () => axiosInstance.get('/api/admin/shop-ledger'),
  getShopInventory: (shopId) => axiosInstance.get(`/api/admin/shop-inventory/${shopId}`),
  addProductToShop: (shopId, data) => axiosInstance.post(`/api/admin/shop-inventory/${shopId}`, data),

  // ✅ NEW: Product Management
  getAllProducts: () => axiosInstance.get('/api/admin/all-products'),
  createProduct: (data) => axiosInstance.post('/api/admin/products', data),
  updateProduct: (productId, data) => axiosInstance.put(`/api/admin/products/${productId}`, data),
  getCategories: () => axiosInstance.get('/api/admin/categories'),
  getUnits: () => axiosInstance.get('/api/admin/units'),

  // Dispatch operations
  createDispatch: (data) => axiosInstance.post('/api/dispatch', data),
  createBatchDispatch: (data) => axiosInstance.post('/api/dispatch', { ...data, isBatchDispatch: true }),
  getDispatches: () => axiosInstance.get('/api/dispatch'),
  getDispatchById: (id) => axiosInstance.get(`/api/dispatch/${id}`),
  updateDispatch: (id, data) => axiosInstance.put(`/api/dispatch/${id}`, data),
  updateDispatchStatus: (id, data) => axiosInstance.put(`/api/dispatch/${id}/status`, data),
  getDispatchAnalytics: (filters = {}) => axiosInstance.get('/api/dispatch/analytics', { params: filters }),

  // Stock Ledger
  getStockLedger: () => axiosInstance.get('/api/ledger'),
  getLedgerByShop: (shopId) => axiosInstance.get(`/api/ledger/shop/${shopId}`),
  getLedgerByProduct: (productId) => axiosInstance.get(`/api/ledger/product/${productId}`),

  // ✅ Stock Alerts (NEW)
  getStockAlerts: (shopId = null) =>
    axiosInstance.get('/api/ledger/alerts/all', { params: shopId ? { shopId } : {} }),
  getAlertCount: (shopId = null) =>
    axiosInstance.get('/api/ledger/alerts/count', { params: shopId ? { shopId } : {} }),
  getStockReport: () => axiosInstance.get('/api/ledger/report/stock'),

  // Restock Requests
  createRestockRequest: (data) => axiosInstance.post('/api/ledger/restock-requests', data),
  getRestockRequests: (params = {}) => axiosInstance.get('/api/ledger/restock-requests', { params }),
  updateRestockRequestStatus: (id, data) => axiosInstance.put(`/api/ledger/restock-requests/${id}`, data),
  getRestockRequestsCount: () => axiosInstance.get('/api/ledger/restock-requests/count'),

  // Reports
  generateReport: (filters) => axiosInstance.get('/api/admin/reports', { params: filters }),

  // Sales
  getAllSales: () => axiosInstance.get('/api/sales'),

  // Staff Performance
  getStaffPerformance: () => axiosInstance.get('/api/admin/staff-performance'),
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/api/admin/staff-performance/${staffId}`, { params: { year, month } }),
  getShopStaffPerformance: (shopId, period = 'monthly', year, month) =>
    axiosInstance.get(`/api/admin/shop-staff-performance/${shopId}`, {
      params: { period, year, month }
    }),

  // Returns Management
  getReturns: (shopId = null) => axiosInstance.get('/api/return', { params: shopId ? { shopId } : {} }),
  getPendingReturns: () => axiosInstance.get('/api/return/pending/count'),
  getReturnById: (id) => axiosInstance.get(`/api/return/${id}`),
  updateReturnStatus: (id, data) => axiosInstance.put(`/api/return/${id}/status`, data)
};
