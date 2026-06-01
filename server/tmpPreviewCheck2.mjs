import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const { getSuperAdminDashboard } = await import("./src/services/superAdminDashboardService.js");
const preview = await getSuperAdminDashboard({ days: 7, limit: 5 });
console.log(JSON.stringify({ summary: preview.summary, branchAnalytics: preview.branchAnalytics.slice(0,5), topBranches: preview.summary.topBranches }, null, 2));
await mongoose.disconnect();
