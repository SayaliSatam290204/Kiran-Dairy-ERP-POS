import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const Sale = (await import("./src/models/Sale.js")).default;
const agg = await Sale.aggregate([
  { $match: { saleDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
  { $group: { _id: "$shopId", totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
  { $sort: { totalRevenue: -1 } }
]);
console.log(JSON.stringify(agg.slice(0,10), null, 2));
await mongoose.disconnect();
