import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Staff from '../models/Staff.js';
import StaffPayment from '../models/StaffPayment.js';
import { responseHelper } from '../utils/responseHelper.js';

const signPosToken = (staffId, shopId) => {
  return jwt.sign(
    { staffId, shopId },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

export const staffController = {
  // Get all staff for admin or shop manager
  getAllStaff: async (req, res) => {
    try {
      const { shopId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = {};

      // Shop manager can only see staff of their shop
      if (userRole === 'shop') {
        query.shopId = req.user.shopId;
      } else if (shopId) {
        // Admin can filter by specific shop
        query.shopId = new mongoose.Types.ObjectId(shopId);
      }

      const staff = await Staff.find(query)
        // Include baseSalary so Staff Management table can show it
        .select('+baseSalary')
        .populate('shopId', 'name location')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      return responseHelper.success(res, staff, 'Staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get single staff by ID
  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const staff = await Staff.findById(id)
        .populate('shopId', 'name location')
        .populate('createdBy', 'name email');

      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only view staff from their shop
      if (userRole === 'shop' && staff.shopId._id.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      return responseHelper.success(res, staff, 'Staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Create new staff
  createStaff: async (req, res) => {
    try {
      const { name, email, phone, shopId, shifts, baseSalary, joinDate, notes } = req.body;
      const userRole = req.user.role;
      const userId = req.user.id;

      // Validation
      if (!name || !email || !phone || !baseSalary || !joinDate) {
        return responseHelper.error(res, 'Missing required fields', 400);
      }

      // Shop manager can only create staff for their shop
      const assignedShopId = userRole === 'shop' ? req.user.shopId : shopId;
      if (!assignedShopId) {
        return responseHelper.error(res, 'Shop ID is required', 400);
      }

      // Check if email already exists
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return responseHelper.error(res, 'Email already exists', 400);
      }

      const newStaff = new Staff({
        name,
        email,
        phone,
        shopId: assignedShopId,
        shifts: shifts || ['morning'],
        baseSalary,
        joinDate,
        createdBy: userId,
        notes
      });

      if (req.body.pin) {
        const pinHash = await bcryptjs.hash(String(req.body.pin).trim(), 10);
        newStaff.pinHash = pinHash;
      }

      await newStaff.save();
      await newStaff.populate('shopId', 'name location');
      await newStaff.populate('createdBy', 'name email');

      return responseHelper.success(res, newStaff, 'Staff created successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Update staff
  updateStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, shifts, baseSalary, status, joinDate, notes } = req.body;
      const userRole = req.user.role;

      const staff = await Staff.findById(id);
      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only update staff from their shop
      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Update fields
      if (name) staff.name = name;
      if (email && email !== staff.email) {
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
          return responseHelper.error(res, 'Email already exists', 400);
        }
        staff.email = email;
      }
      if (phone) staff.phone = phone;
      if (shifts) staff.shifts = shifts;
      if (baseSalary) staff.baseSalary = baseSalary;
      if (status) staff.status = status;
      if (joinDate) staff.joinDate = joinDate;
      if (notes !== undefined) staff.notes = notes;
      if (req.body.pin) {
        staff.pinHash = await bcryptjs.hash(String(req.body.pin).trim(), 10);
      }

      await staff.save();
      await staff.populate('shopId', 'name location');
      await staff.populate('createdBy', 'name email');

      return responseHelper.success(res, staff, 'Staff updated successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

// Delete staff (soft delete)
  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const staff = await Staff.findById(id);
      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only delete staff from their shop
      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Keep data model history (payments will be removed), but remove staff from staff management list.
      await StaffPayment.deleteMany({ staffId: id });
      await Staff.findByIdAndDelete(id);

      return responseHelper.success(res, staff, 'Staff deleted successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get staff by shop
  getStaffByShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const userRole = req.user.role;

      // Shop manager can only view their own shop's staff
      if (userRole === 'shop' && shopId !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      const staff = await Staff.find({
        shopId: new mongoose.Types.ObjectId(shopId),
        isActive: true
      })
        .populate('shopId', 'name location')
        .sort({ name: 1 });

      return responseHelper.success(res, staff, 'Shop staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Authorize staff for POS billing
  authorizeStaff: async (req, res) => {
    try {
      const { staffId, pin } = req.body;
      const userRole = req.user.role;

      if (!staffId || !pin) {
        return responseHelper.error(res, 'Staff ID and PIN are required', 400);
      }

      const staff = await Staff.findById(staffId).select('+pinHash shopId status');
      if (!staff) {
        return responseHelper.error(res, 'Staff member not found', 404);
      }

      if (staff.status !== 'active') {
        return responseHelper.error(res, 'Staff member is not active', 403);
      }

      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access to staff member', 403);
      }

      if (!staff.pinHash) {
        return responseHelper.error(res, 'Staff PIN is not configured. Set a PIN in staff management.', 403);
      }

      const providedPin = String(pin).trim();
      const isvalidPin = await bcryptjs.compare(providedPin, staff.pinHash);

      if (!isvalidPin) {
        return responseHelper.error(res, 'Invalid staff PIN', 401);
      }

      const token = signPosToken(staff._id.toString(), staff.shopId.toString());

      return responseHelper.success(res, {
        token,
        staffId: staff._id,
        name: staff.name
      }, 'Staff authorized successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  }
};
