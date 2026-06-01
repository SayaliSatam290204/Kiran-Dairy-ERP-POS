import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const { getSuperAdminDashboard } = await import("./src/services/superAdminDashboardService.js");
const preview = await getSuperAdminDashboard({ days: 7, limit: 50 });
const analytics = preview.branchAnalytics.map((shop) => ({
  shopName: shop.shopName,
  actualRevenue: shop.actualRevenue,
  expectedRevenue: shop.expectedRevenue,
  totalTransactions: shop.totalTransactions,
  productsCount: shop.productsCount,
  staffCount: shop.staffCount,
}));
console.log(JSON.stringify(analytics, null, 2));
await mongoose.disconnect();
