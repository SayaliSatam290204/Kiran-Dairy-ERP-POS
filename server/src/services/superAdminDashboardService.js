import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Staff from "../models/Staff.js";
import Return from "../models/Return.js";

/* =========================
   SUPER ADMIN DASHBOARD
========================= */
export const getSuperAdminDashboard = async (options = {}) => {
  const {
    days = 30,
    limit = 10,
    productLimit = 50,
    startDate,
    endDate,
    selectedBranches, // Added: array of shop IDs to filter by
  } = options;

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startDate ? new Date(startDate) : new Date(end);
  if (!startDate) {
    start.setDate(end.getDate() - days);
  }
  start.setHours(0, 0, 0, 0);

  try {
    // Get active shops
    const shops = await Shop.find({ isActive: true })
      .select("name location ownerName contactNo email")
      .lean();

    if (!shops.length) {
      return {
        summary: {
          totalBranches: 0,
          totalProducts: 0,
          totalProductsStocked: 0,
          totalStockValue: 0,
          totalSalesTransactions: 0,
          totalReturns: 0,
          totalRevenue: 0,
          totalExpectedRevenue: 0,
          totalStaff: 0,
          topBranches: [],
        },
        branchAnalytics: [],
        productDistribution: [],
        shops: [],
      };
    }

    const shopIds = shops.map((s) => s._id);

    // Use AGGREGATIONS for performance (instead of loading all records)
    const [
      salesSummary,
      returnsSummary,
      staffCount,
      productSummary,
      inventorySummary,
      paymentMethodSummary
    ] = await Promise.all([
      // Sales aggregation: much faster than loading all sales
      Sale.aggregate([
        { $match: { 
          shopId: { $in: shopIds },
          createdAt: { $gte: start }
        }},
        {
          $group: {
            _id: "$shopId",
            totalRevenue: { $sum: "$totalAmount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit * 2 } // Extra for accurate top N
      ]),

      // Returns aggregation
      Return.aggregate([
        { $match: { 
          shopId: { $in: shopIds },
          createdAt: { $gte: start }
        }},
        {
          $group: {
            _id: "$shopId",
            totalReturns: { $sum: 1 },
            totalRefund: { $sum: "$totalRefund" }
          }
        }
      ]),

      // Staff count
      Staff.aggregate([
        { $match: { shopId: { $in: shopIds }, isActive: true } },
        {
          $group: {
            _id: "$shopId",
            staffCount: { $sum: 1 }
          }
        }
      ]),

      // Products (limit to active/top products)
      Product.aggregate([
        { 
          $lookup: {
            from: "inventories",
            let: { productId: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$productId", "$$productId"] } } }],
            as: "inventory"
          }
        },
        { $match: { "inventory.0": { $exists: true } } }, // Only stocked products
        { $sort: { "inventory.0.quantity": -1 } },
        { $limit: 50 }
      ]),

      Inventory.aggregate([
        { $match: { shopId: { $in: shopIds } } },
        {
          $group: {
            _id: "$shopId",
            totalQuantity: { $sum: "$quantity" },
            productCount: { $sum: 1 }
          }
        }
      ]),
      // Payment method breakdown
      Sale.aggregate([
        { $match: { 
          shopId: { $in: shopIds },
          createdAt: { $gte: start }
        }},
        {
          $group: {
            _id: "$paymentMethod",
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalProductsCount = await Product.countDocuments({});

    // Convert aggregation results to maps with null safety
    const salesByShopMap = new Map();
    for (const s of salesSummary) {
      if (s && s._id) {
        salesByShopMap.set(s._id.toString(), {
          totalRevenue: s.totalRevenue || 0,
          transactionCount: s.transactionCount || 0
        });
      }
    }

    const returnsByShopMap = new Map();
    for (const r of returnsSummary) {
      if (r && r._id) {
        returnsByShopMap.set(r._id.toString(), {
          totalReturns: r.totalReturns || 0,
          totalRefund: r.totalRefund || 0
        });
      }
    }

    const staffByShopMap = new Map();
    for (const s of staffCount) {
      if (s && s._id) {
        staffByShopMap.set(s._id.toString(), s.staffCount || 0);
      }
    }

    const inventoryByShopMap = new Map();
    for (const i of inventorySummary) {
      if (i && i._id) {
        inventoryByShopMap.set(i._id.toString(), i);
      }
    }

    // Get top products only (limit processing)
    const productPriceMap = new Map();
    for (const p of productSummary) {
      if (p && p._id) {
        productPriceMap.set(p._id.toString(), p.price || 0);
      }
    }

    // BRANCH ANALYTICS using aggregation data
    const branchAnalytics = shops.map((shop) => {
      const shopIdStr = shop._id.toString();
      const sales = salesByShopMap.get(shopIdStr) || { totalRevenue: 0, transactionCount: 0 };
      const returnsData = returnsByShopMap.get(shopIdStr) || { totalReturns: 0, totalRefund: 0 };
      const staffCount = staffByShopMap.get(shopIdStr) || 0;
      const invSummary = inventoryByShopMap.get(shopIdStr) || { totalQuantity: 0, productCount: 0 };

      // Approximate stock value (we can add exact calculation endpoint if needed)
      const stockValue = invSummary.totalQuantity * 150; // Avg price estimate

      return {
        shopId: shop._id,
        shopName: shop.name,
        location: shop.location,
        ownerName: shop.ownerName,
        contactNo: shop.contactNo,
        email: shop.email,

        actualRevenue: sales.totalRevenue,
        expectedRevenue: stockValue,
        revenueDifference: stockValue - sales.totalRevenue,

        totalTransactions: sales.transactionCount,
        productsCount: invSummary.productCount || 0,
        totalStockValue: stockValue,

        staffCount,
        returnsCount: returnsData.totalReturns,
        returnValue: returnsData.totalRefund,
      };
    }).slice(0, limit * 2); // Limit returned data

    // PRODUCT DISTRIBUTION (limited and date-range + branch filtered)
    const productSalesMatch = {
      saleDate: { $gte: start, $lte: end },
      paymentStatus: "completed",
    };

    const inventoryMatch = {
      shopId: { $in: shopIds },
    };

    // Filter by selected branches if provided
    if (selectedBranches && Array.isArray(selectedBranches) && selectedBranches.length > 0) {
      const branchObjectIds = selectedBranches.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      productSalesMatch.shopId = { $in: branchObjectIds };
      inventoryMatch.shopId = { $in: branchObjectIds };
    }

    const [productSales, inventoryProducts] = await Promise.all([
      Sale.aggregate([
        { $match: productSalesMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.subtotal" },
            branchesStocking: { $addToSet: "$shopId" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: "$_id",
            productName: {
              $ifNull: ["$product.name", "Unknown Product"],
            },
            category: { $ifNull: ["$product.category", "N/A"] },
            price: { $ifNull: ["$product.price", 0] },
            totalQuantity: 1,
            totalRevenue: 1,
            branchesStocking: { $size: "$branchesStocking" },
          },
        },
      ]),
      Inventory.aggregate([
        { $match: inventoryMatch },
        {
          $group: {
            _id: "$productId",
            totalStockQuantity: { $sum: "$quantity" },
            branchesStocking: { $addToSet: "$shopId" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: "$_id",
            productName: { $ifNull: ["$product.name", "Unknown Product"] },
            category: { $ifNull: ["$product.category", "N/A"] },
            price: { $ifNull: ["$product.price", 0] },
            totalStockQuantity: 1,
            branchesStocking: { $size: "$branchesStocking" },
          },
        },
      ]),
    ]);

    const salesMap = new Map(productSales.map((item) => [item.productId.toString(), item]));
    const inventoryMap = new Map(inventoryProducts.map((item) => [item.productId.toString(), item]));

    const allProductIds = new Set([
      ...inventoryMap.keys(),
      ...salesMap.keys(),
    ]);

    const productDistribution = Array.from(allProductIds)
      .map((productId) => {
        const inventoryItem = inventoryMap.get(productId);
        const salesItem = salesMap.get(productId);

        return {
          productId,
          productName: inventoryItem?.productName || salesItem?.productName || "Unknown Product",
          category: inventoryItem?.category || salesItem?.category || "N/A",
          price: inventoryItem?.price ?? salesItem?.price ?? 0,
          totalQuantity: salesItem?.totalQuantity || 0,
          totalRevenue: salesItem?.totalRevenue || 0,
          branchesStocking:
            inventoryItem?.branchesStocking ?? salesItem?.branchesStocking ?? 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalQuantity - a.totalQuantity)
      .slice(0, productLimit);

    // Keep legacy branch analytics and summary calculations
    const totalSalesTransactions = salesSummary.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
    const totalRevenue = salesSummary.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalReturnsCount = returnsSummary.reduce((sum, r) => sum + (r.totalReturns || 0), 0);
    const totalStaff = staffCount.reduce((sum, s) => sum + (s.staffCount || 0), 0);

    const totalStockValue = inventorySummary.reduce((sum, i) => sum + (i.totalQuantity * 150), 0);

    const topBranches = branchAnalytics
      .sort((a, b) => b.actualRevenue - a.actualRevenue)
      .slice(0, Math.min(limit, 5));

    return {
      summary: {
        totalBranches: shops.length,
        totalProducts: totalProductsCount,
        totalProductsStocked: inventorySummary.reduce((sum, i) => sum + (i.productCount || 0), 0),
        totalStockValue,
        totalSalesTransactions,
        totalReturns: totalReturnsCount,
        totalRevenue,
        totalExpectedRevenue: totalStockValue,
        totalStaff,
        topBranches,
        timeRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          days: Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1,
        },
      },
      branchAnalytics,
      productDistribution,
      dailyTrends: await getDailyTrends(start, end, selectedBranches),
      paymentMethods: paymentMethodSummary.map(p => ({
        name: p._id === 'split' ? 'Cash + UPI' : (p._id ? p._id.toUpperCase() : 'N/A'),
        value: p.revenue || 0,
        count: p.count || 0
      })),
      shops: shops.slice(0, limit),
    };
  } catch (err) {
    console.error("Dashboard Error:", err);
    throw err;
  }
};

/* =========================
   FULL WORKING BRANCH REPORT (FIXED)
========================= */
export const getBranchReport = async (shopId) => {
  const shop = await Shop.findById(shopId).lean();
  if (!shop) throw new Error("Shop not found");

  const [sales, inventory, staff, returns] = await Promise.all([
    Sale.find({ shopId }).lean(),
    Inventory.find({ shopId }).populate("productId").lean(),
    Staff.find({ shopId, isActive: true }).lean(),
    Return.find({ shopId }).lean(),
  ]);

  const totalRevenue = sales.reduce(
    (s, x) => s + (x.totalAmount || 0),
    0
  );

  // Calculate Product Performance
  const productPerformanceMap = {};

  // Track all inventory items (including those with 0 sales)
  inventory.forEach(inv => {
    if (inv.productId) {
      productPerformanceMap[inv.productId._id.toString()] = {
        productName: inv.productId.name,
        revenue: 0,
        quantity: 0
      };
    }
  });

  // Aggregate actual sales
  sales.forEach(sale => {
    sale.items?.forEach(item => {
      const pId = item.productId?.toString();
      if (!pId) return;
      if (!productPerformanceMap[pId]) {
        productPerformanceMap[pId] = {
          productName: item.productName || "Unknown",
          revenue: 0,
          quantity: 0
        };
      }
      productPerformanceMap[pId].revenue += (item.subtotal || (item.price * item.quantity) || 0);
      productPerformanceMap[pId].quantity += (item.quantity || 0);
    });
  });

  const sortedProducts = Object.values(productPerformanceMap).sort((a, b) => b.revenue - a.revenue);
  
  let topPerformingProduct = null;
  let avgPerformingProduct = null;
  let lessPerformingProduct = null;

  if (sortedProducts.length > 0) {
    topPerformingProduct = sortedProducts[0];
    lessPerformingProduct = sortedProducts[sortedProducts.length - 1];
    avgPerformingProduct = sortedProducts[Math.floor(sortedProducts.length / 2)];
  }

  return {
    branch: shop,
    sales,
    inventory,
    staff,
    totalRevenue,
    expectedRevenue: inventory.reduce(
      (s, i) => s + (i.quantity || 0) * (i.productId?.price || 0),
      0
    ),
    returns: returns.length,
    returnValue: returns.reduce((s, r) => s + (r.totalRefund || 0), 0),
    topPerformingProduct,
    avgPerformingProduct,
    lessPerformingProduct
  };
};

/* =========================
   REVENUE TRENDS
========================= */
export const getRevenueTrends = async (startDate, endDate) => {
  const sales = await Sale.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).lean();

  const shops = await Shop.find({ isActive: true }).lean();

  return shops.map((shop) => {
    const shopSales = sales.filter(
      (s) => s.shopId.toString() === shop._id.toString()
    );

    return {
      shopName: shop.name,
      revenue: shopSales.reduce((s, x) => s + (x.totalAmount || 0), 0),
      transactions: shopSales.length,
    };
  });
};

/* =========================
   DAILY REVENUE TRENDS (NEW)
========================= */
export const getDailyTrends = async (startDate, endDate, selectedBranches = []) => {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: "completed"
  };

  if (selectedBranches && selectedBranches.length > 0) {
    const branchObjectIds = selectedBranches.map(id => new mongoose.Types.ObjectId(id));
    match.shopId = { $in: branchObjectIds };
  }

  const trends = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: "$_id",
        revenue: 1,
        count: 1,
        _id: 0
      }
    }
  ]);

  return trends;
};
