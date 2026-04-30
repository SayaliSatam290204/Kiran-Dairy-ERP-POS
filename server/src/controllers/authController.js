//server/src/controllers/authControllers.js
import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Shop from "../models/Shop.js";

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      location,
      ownerName,
      contactNo,
      address,
      isActive
    } = req.body;

    if (!name || !password || !role || (!email && !phone)) {
      return res
        .status(400)
        .json({ message: "Name, role, password and Email/Phone are required" });
    }

    let shopDoc = null;
    if (role === "shop") {
      if (!location || !ownerName || !contactNo || !address) {
        return res
          .status(400)
          .json({ message: "All shop fields are required" });
      }

      const existingShopByEmail = await Shop.findOne({ email });
      if (existingShopByEmail) {
        return res.status(409).json({ message: "Shop with this email already exists" });
      }
      const existingShopByPhone = await Shop.findOne({ contactNo });
      if (existingShopByPhone) {
        return res
          .status(409)
          .json({ message: "Shop with this contact number already exists" });
      }
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(409).json({ message: "User email already exists" });
      }
      const existingUserByUsername = await User.findOne({ username: name });
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Shop name already taken" });
      }

      shopDoc = await Shop.create({
        name,
        location,
        ownerName,
        contactNo,
        email,
        address,
        isActive: isActive ?? true
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone already registered" });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const userPayload = {
      name,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      role
    };
    if (shopDoc) {
      userPayload.shopId = shopDoc._id;
      userPayload.phone = contactNo || null;
      userPayload.username = name;
      userPayload.name = ownerName;
    }

    const user = await User.create(userPayload);

    const token = jwt.sign(
      { id: user._id, role: user.role, shopId: user.shopId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email || null,
          phone: user.phone || null,
          role: user.role,
          shopId: user.shopId,
          isActive: user.isActive
        },
        token
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email/Phone already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const authController = {
  // ✅ LOGIN (Admin/Super-Admin: email + password) | (Shop: username/shop name + password)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!password || !email) {
        return res
          .status(400)
          .json({ message: "Email/Username and password are required" });
      }

      const identifier = String(email).trim();
      const isEmail = identifier.includes("@");
      let user = null;

      if (isEmail) {
        const normalizedEmail = identifier.toLowerCase();
        user = await User.findOne({ email: normalizedEmail }).select("+password");
      }

      if (!user) {
        user = await User.findOne({
          $or: [
            { username: new RegExp(`^${escapeRegExp(identifier)}$`, "i") },
            { phone: new RegExp(`^${escapeRegExp(identifier)}$`, "i") }
          ]
        }).select("+password");
      }

      if (!user) {
        console.log('❌ User not found for identifier:', identifier);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('✅ User found:', user.email || user.username, 'Role:', user.role);

      // ✅ Check active
      if (user.isActive === false) {
        console.log('❌ Account inactive:', user.email);
        return res.status(403).json({ message: "Account is inactive" });
      }

      let isPasswordValid = false;
      if (user.role === 'shop') {
        // Shop login may use the phone number as password.
        const phoneMatch = password === user.phone;
        const hashedMatch = user.password
          ? await bcryptjs.compare(password, user.password)
          : false;
        isPasswordValid = phoneMatch || hashedMatch;

        console.log('🔑 Shop login check:', {
          email: user.email,
          role: user.role,
          phoneMatch,
          hashedMatch
        });
      } else {
        // For admin/super-admin, use bcrypt.
        isPasswordValid = await bcryptjs.compare(password, user.password);
        console.log('🔑 Admin password valid:', isPasswordValid);
      }
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for:', user.email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, shopId: user.shopId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email || null,
            phone: user.phone || null,
            role: user.role,
            shopId: user.shopId,
            isActive: user.isActive
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  register: registerUser,

  registerAdmin: async (req, res) => {
    const requiredKey = process.env.ADMIN_REGISTRATION_KEY;
    if (requiredKey && req.body?.adminKey !== requiredKey) {
      return res.status(403).json({ message: "Invalid or missing admin key" });
    }
    return registerUser({ ...req, body: { ...req.body, role: "admin" } }, res);
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      const user = await User.findById(userId).select("+password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let currentValid = false;
      if (user.role === "shop") {
        const phoneMatch = currentPassword === user.phone;
        const hashedMatch = user.password
          ? await bcryptjs.compare(currentPassword, user.password)
          : false;
        currentValid = phoneMatch || hashedMatch;
      } else {
        currentValid = await bcryptjs.compare(currentPassword, user.password);
      }

      if (!currentValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  adminExists: async (req, res) => {
    try {
      const count = await User.countDocuments({
        role: { $in: ["admin", "super-admin"] }
      });
      res.json({ exists: count > 0 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};