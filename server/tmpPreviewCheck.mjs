import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const Sale = (await import("./src/models/Sale.js")).default;
const shopCount = await Sale.countDocuments();
console.log("totalSalesCount=", shopCount);
const recent = await Sale.find({ saleDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).limit(20).lean();
console.log("recentSalesCount=", recent.length);
console.log(JSON.stringify(recent.slice(0, 5), null, 2));
const agg = await Sale.aggregate([
  { $match: { saleDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
  { $group: { _id: "$shopId", totalRevenue: { $sum: "$totalAmount" }, transactionCount: { $sum: 1 } } }
]);
console.log("salesAgg7Days=", JSON.stringify(agg, null, 2));
await mongoose.disconnect();
