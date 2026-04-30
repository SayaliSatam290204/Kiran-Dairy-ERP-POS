import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

import Sale from '../models/Sale.js';
import Shop from '../models/Shop.js';
import Dispatch from '../models/Dispatch.js';
import Inventory from '../models/Inventory.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import StaffPayment from '../models/StaffPayment.js';

import { generateBillNo } from '../utils/generateBillNo.js';
import { generateDispatchNo } from '../utils/generateDispatchNo.js';
import connectDB from '../config/db.js';

const seedAnalyticsData = async () => {
  try {
    console.log('[ANALYTICS-SEED] Starting analytics data generation...');

    await connectDB();
    console.log('[✓] Connected to database\n');

    // ================= CLEAR OLD DATA =================
    console.log('[CLEAR] Removing old demo data...');
    await Sale.deleteMany({});
    await Dispatch.deleteMany({});
    await Inventory.deleteMany({});
    await StaffPayment.deleteMany({});
    console.log('[✓] Old demo data cleared\n');

    // ================= FETCH BASE DATA =================
    const allProducts = await Product.find({ isActive: true });
    const baseShops = await Shop.find({ isActive: true });
    const adminUser = await User.findOne({ role: 'admin' });

    if (!allProducts.length || !baseShops.length) {
      console.log('❌ Need products and shops first. Run seedDemoData.js');
      process.exit(1);
    }

    // Use only first 23 products
    const products = allProducts.slice(0, 23);
    console.log(`[INFO] Using ${products.length} products for analytics, found ${baseShops.length} base shops`);

    // ================= CREATE NEW SHOPS TO REACH 5 TOTAL =================
    console.log('[SHOPS] Ensuring 5 branches...');

    const existingWest = await Shop.findOne({ name: 'Kiran Dairy West Market' });
    const existingNorth = await Shop.findOne({ name: 'Kiran Dairy North Hub' });
    const existingEast = await Shop.findOne({ name: 'Kiran Dairy East Plaza' });

    const newShops = [];

    if (!existingWest) {
      const westShop = await Shop.create({
        name: 'Kiran Dairy West Market',
        location: 'West Market, Pune',
        ownerName: 'Vijay Patil',
        contactNo: '9876543213',
        email: 'west@kirandairy.com',
        address: 'West Market, Pune 411001',
        isActive: true
      });
      newShops.push(westShop);
      console.log('   ✓ Created West Market branch');
    }

    if (!existingNorth) {
      const northShop = await Shop.create({
        name: 'Kiran Dairy North Hub',
        location: 'North Pune',
        ownerName: 'Neha Gupta',
        contactNo: '9876543214',
        email: 'north@kirandairy.com',
        address: 'North Main Road, Pune 411005',
        isActive: true
      });
      newShops.push(northShop);
      console.log('   ✓ Created North Hub branch');
    }

    if (!existingEast) {
      const eastShop = await Shop.create({
        name: 'Kiran Dairy East Plaza',
        location: 'East Pune',
        ownerName: 'Akshay Kumar',
        contactNo: '9876543215',
        email: 'east@kirandairy.com',
        address: 'East Main Road, Pune 411044',
        isActive: true
      });
      newShops.push(eastShop);
      console.log('   ✓ Created East Plaza branch');
    }

    const allShops = [...baseShops, ...newShops].slice(0, 5);
    console.log(`[✓] Total shops ready: ${allShops.length}\n`);

    // ================= CREATE SHOP USERS =================
    if (newShops.length > 0) {
      const shopPassword = await bcryptjs.hash('demo123', 10);
      const userData = newShops.map((shop) => ({
        name: shop.ownerName,
        phone: shop.contactNo,
        email: shop.email,
        password: shopPassword,
        role: 'shop',
        shopId: shop._id,
        isActive: true
      }));

      await User.insertMany(userData);
      console.log(`[✓] Created ${userData.length} shop users\n`);
    }

    // ================= STAFF CREATION =================
    console.log('[STAFF] Creating 5 staff per shop...');
    const staffNames = ['Ramesh Kumar', 'Sita Devi', 'Rajesh M.', 'Priya S.', 'Vijay P.'];
    const staffToCreate = [];

    for (const shop of allShops) {
      for (let j = 0; j < staffNames.length; j++) {
        const name = staffNames[j];
        const staffId = new mongoose.Types.ObjectId();
        const email = `${name.toLowerCase().replace(/\s+/g, '')}-${shop._id}@staff.local`;

        staffToCreate.push({
          _id: staffId,
          name,
          email,
          phone: `98${700000000 + Math.floor(Math.random() * 1000000)}`,
          shopId: shop._id,
          baseSalary: 15000 + Math.floor(Math.random() * 5000),
          status: 'active',
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          createdBy: adminUser._id,
          isActive: true
        });
      }
    }

    await Staff.deleteMany({ shopId: { $in: allShops.map(s => s._id) } });
    if (staffToCreate.length > 0) {
      await Staff.insertMany(staffToCreate);
    }
    console.log(`[✓] Staff created: ${staffToCreate.length} total\n`);

    const staffByShop = new Map();
    for (const shop of allShops) {
      staffByShop.set(shop._id.toString(), await Staff.find({ shopId: shop._id }).select('_id name'));
    }

    // ================= HELPERS =================
    function getProductCategory(productName) {
      const nameLower = productName.toLowerCase();
      if (nameLower.includes('milk') || nameLower.includes('curd') || nameLower.includes('paneer') || nameLower.includes('ghee')) return 'dairy';
      if (nameLower.includes('ice') || nameLower.includes('cream')) return 'icecream';
      if (nameLower.includes('bread') || nameLower.includes('butter')) return 'bread';
      return 'other';
    }

    function calculateProfit(totalAmount, category) {
      const margins = { dairy: 0.25, icecream: 0.35, bread: 0.15, other: 0.25 };
      return Math.round(totalAmount * (margins[category] || 0.25));
    }

    function getPeakHour(baseDate) {
      const rand = Math.random();
      let hour = 9 + Math.floor(Math.random() * 9); // Default
      if (rand < 0.2) hour = 8 + Math.floor(Math.random() * 3); // Morning peak
      else if (rand < 0.5) hour = 17 + Math.floor(Math.random() * 4); // Evening peak
      return new Date(baseDate.getTime() + hour * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000);
    }

    // ================= DISPATCHES =================
    console.log('[DISPATCH] Creating 5 dispatches per shop...');
    let dispatchCount = 0;
    for (const shop of allShops) {
      for (let d = 1; d <= 5; d++) {
        const dispatchNo = await generateDispatchNo();
        const dispatchItems = products.map(p => ({
          productId: p._id,
          quantity: 20 + Math.floor(Math.random() * 80),
          status: 'received'
        }));

        const dispatchDate = new Date(Date.UTC(2026, 3, d + (d - 1) * 6));
        const shopStaff = staffByShop.get(shop._id.toString());

        await Dispatch.create({
          dispatchNo,
          shopId: shop._id,
          items: dispatchItems,
          status: 'received',
          dispatchDate,
          receivedDate: new Date(dispatchDate.getTime() + 24 * 60 * 60 * 1000),
          confirmedBy: shopStaff?.[0]?._id
        });
        dispatchCount++;
      }
    }
    console.log(`[✓] Created ${dispatchCount} dispatches\n`);

    // ================= INVENTORY (FIXED) =================
    console.log('[INVENTORY] Updating inventory per shop...');
    const inventoryToCreate = [];
    for (const shop of allShops) {
      for (const p of products) {
        inventoryToCreate.push({
          shopId: shop._id,
          productId: p._id,
          quantity: 50 + Math.floor(Math.random() * 100),
          lastUpdated: new Date()
        });
      }
    }
    await Inventory.deleteMany({ shopId: { $in: allShops.map(s => s._id) } });
    await Inventory.insertMany(inventoryToCreate);
    console.log(`[✓] Updated ${inventoryToCreate.length} inventory records\n`);

    // ================= SALES =================
    console.log('[SALES] Creating sales data for April 2026...');
    const shopRevenueTargets = {
      0: { expectedDaily: 8300, transactions: 25 },
      1: { expectedDaily: 6500, transactions: 20 },
      2: { expectedDaily: 9600, transactions: 32 },
      3: { expectedDaily: 5800, transactions: 18 },
      4: { expectedDaily: 7400, transactions: 22 }
    };

    let totalSalesCreated = 0;
    const salesToInsert = [];
    let billCounter = 1;

    for (let day = 1; day <= 30; day++) {
      const currentDate = new Date(Date.UTC(2026, 3, day));
      for (let shopIdx = 0; shopIdx < allShops.length; shopIdx++) {
        const shop = allShops[shopIdx];
        const target = shopRevenueTargets[shopIdx];
        const shopStaff = staffByShop.get(shop._id.toString());

        const dayOfWeek = currentDate.getDay();
        const multiplier = (dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1.0) * (day > 20 ? 1.2 : 1.0);
        const transactionsToday = Math.ceil(target.transactions * (0.8 + Math.random() * 0.4) * multiplier);

        for (let t = 0; t < transactionsToday; t++) {
          const items = [];
          let total = 0;
          const itemCount = 1 + Math.floor(Math.random() * 4);

          for (let i = 0; i < itemCount; i++) {
            const prod = products[Math.floor(Math.random() * products.length)];
            const qty = 1 + Math.floor(Math.random() * 5);
            const subtotal = prod.price * qty;
            items.push({ productId: prod._id, productName: prod.name, quantity: qty, price: prod.price, subtotal });
            total += subtotal;
          }

          const avgBillValue = target.expectedDaily / target.transactions;
          const finalTotal = Math.round(avgBillValue * (0.7 + Math.random() * 0.6));
          const primaryCategory = items.length > 0 ? getProductCategory(items[0].productName) : 'other';
          const saleTime = getPeakHour(currentDate);

          salesToInsert.push({
            billNo: `BILL/${String(billCounter++).padStart(6, '0')}`,
            shopId: shop._id,
            staffId: shopStaff?.[Math.floor(Math.random() * shopStaff.length)]?._id,
            items,
            totalAmount: finalTotal,
            profit: calculateProfit(finalTotal, primaryCategory),
            paymentMethod: 'cash',
            paymentStatus: 'completed',
            saleDate: saleTime,
            createdAt: saleTime
          });
          totalSalesCreated++;
        }
      }
    }

    if (salesToInsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < salesToInsert.length; i += chunkSize) {
        await Sale.insertMany(salesToInsert.slice(i, i + chunkSize), { ordered: false });
      }
    }
    console.log(`[✓] Created ${totalSalesCreated} sales transactions\n`);

    // ================= STAFF PAYMENTS =================
    console.log('[STAFF-PAYMENTS] Creating payment records...');
    const staffPaymentDocs = [];
    const createdStaff = await Staff.find({ shopId: { $in: allShops.map(s => s._id) } });

    for (const staff of createdStaff) {
      for (let p = 0; p < 2; p++) {
        staffPaymentDocs.push({
          staffId: staff._id,
          shopId: staff.shopId,
          amount: 15000 + Math.floor(Math.random() * 5000),
          paymentDate: new Date(Date.UTC(2026, 3, 16 + p * 14)),
          paymentMethod: 'cash',
          status: 'completed',
          paymentPeriod: {
            startDate: new Date(Date.UTC(2026, 3, 1 + p * 15)),
            endDate: new Date(Date.UTC(2026, 3, 15 + p * 15))
          },
          month: 'April',
          approvedBy: adminUser._id
        });
      }
    }
    await StaffPayment.insertMany(staffPaymentDocs);
    console.log(`[✓] Created ${staffPaymentDocs.length} payment records\n`);

    console.log('═'.repeat(60));
    console.log('[SUCCESS] ANALYTICS SEED COMPLETE');
    console.log('═'.repeat(60));
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedAnalyticsData();