import jwt from "jsonwebtoken";
import StockDiscrepancy from "../models/StockDiscrepancy.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[Auth Error] No token provided in request");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // DEBUG: Log decoded token content
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth Debug] Token decoded successfully. User ID: ${decoded.id}, Role: ${decoded.role}`);
    }
    
    req.user = decoded;
    
    next();
    
    // Add alert counts for dashboard/sidebar - run async after auth, non-blocking
    if (req.user.role === 'admin') {
      (async () => {
        try {
          const pendingDiscrepancies = await StockDiscrepancy.countDocuments({ status: 'pending' });
          req.user.pendingDiscrepancies = pendingDiscrepancies;
        } catch (err) {
          console.error('Failed to fetch pending discrepancies count:', err);
        }
      })();
    }
  } catch (error) {
    console.log("[Auth Error] Token verification failed:", error.message);
    return res.status(401).json({ 
      message: "Invalid token",
      debug: error.message 
    });
  }
};