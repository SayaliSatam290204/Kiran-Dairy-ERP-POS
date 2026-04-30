import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing in server/.env");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 60000, // ⬅ wait longer to connect (60s)
      socketTimeoutMS: 60000,          // ⬅ allow long operations
      maxPoolSize: 20,                 // ⬅ more concurrent connections
      minPoolSize: 5,                  // ⬅ keep some ready
      retryWrites: true,
      w: "majority"
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;