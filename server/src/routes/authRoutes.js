//server/src/routes/authRoutes.js
import express from "express";
import { authController } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Registration
router.post("/admin/register", authController.registerAdmin);

// Super-Admin Registration
router.post("/super-admin/register", authController.registerSuperAdmin);

// ✅ Check if admin exists (for registration flow)
router.get("/admin/exists", authController.adminExists);

// ✅ Login (Admin/Shop)
router.post("/login", authController.login);

// ✅ Add this protected route:
router.post("/change-password", authMiddleware, authController.changePassword);

export default router;