import mongoose from "mongoose";
const uri = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";
await mongoose.connect(uri, { serverSelectionTimeoutMS: 60000 });
const Sale = (await import("./src/models/Sale.js")).default;
const Staff = (await import("./src/models/Staff.js")).default;
const Shop = (await import("./src/models/Shop.js")).default;
const Inventory = (await import("./src/models/Inventory.js")).default;
const Dispatch = (await import("./src/models/Dispatch.js")).default;
const Product = (await import("./src/models/Product.js")).default;
const counts = {
  shops: await Shop.countDocuments({ isActive: true }),
  products: await Product.countDocuments({ isActive: true }),
  sales: await Sale.countDocuments(),
  staff: await Staff.countDocuments({ isActive: true }),
  inventory: await Inventory.countDocuments(),
  dispatches: await Dispatch.countDocuments(),
};
console.log(JSON.stringify(counts, null, 2));
await mongoose.disconnect();
