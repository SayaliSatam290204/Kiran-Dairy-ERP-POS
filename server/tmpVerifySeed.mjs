import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const Sale = (await import("./src/models/Sale.js")).default;
const startDate = new Date(); startDate.setHours(0,0,0,0); startDate.setDate(startDate.getDate() - 29);
const count = await Sale.countDocuments({ createdAt: { $gte: startDate } });
const agg = await Sale.aggregate([
  { $match: { createdAt: { $gte: startDate } } },
  { $group: { _id: "$shopId", revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
  { $sort: { revenue: -1 } }
]);
console.log(JSON.stringify({ startDate: startDate.toISOString(), salesCount: count, topBranches: agg.slice(0,5) }, null, 2));
await mongoose.disconnect();
