import mongoose from 'mongoose';
import StockLedger from '../models/StockLedger.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import RestockRequest from '../models/RestockRequest.js';
import { responseHelper } from '../utils/responseHelper.js';

const STOCK_ALERT_THRESHOLD = 20;

export const ledgerController = {
  getLedger: async (req, res) => {
    try {
      const ledger = await StockLedger.find()
        .populate('shopId', 'name location')
        .populate('productId', 'name sku category price')
        .sort('-transactionDate')
        .limit(500);

      responseHelper.success(res, ledger, 'Ledger fetched successfully');
    } catch (error) {
      console.error('Error fetching ledger:', error);
      responseHelper.error(res, 'Failed to fetch ledger', 500);
    }
  },

  getLedgerByShop: async (req, res) => {
    try {
      const { shopId } = req.params;

      const ledger = await StockLedger.find({ shopId })
        .populate('shopId', 'name location')
        .populate('productId', 'name sku category price')
        .sort('-transactionDate')
        .limit(300);

      responseHelper.success(res, ledger, 'Shop ledger fetched successfully');
    } catch (error) {
      console.error('Error fetching shop ledger:', error);
      responseHelper.error(res, 'Failed to fetch shop ledger', 500);
    }
  },

  getLedgerByProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      const ledger = await StockLedger.find({ productId })
        .populate('shopId', 'name location')
        .populate('productId', 'name sku category price')
        .sort('-transactionDate')
        .limit(200);

      responseHelper.success(res, ledger, 'Product ledger fetched successfully');
    } catch (error) {
      console.error('Error fetching product ledger:', error);
      responseHelper.error(res, 'Failed to fetch product ledger', 500);
    }
  },

  getStockAlerts: async (req, res) => {
    try {
      const { shopId } = req.query;

      const matchStage = {
        quantity: { $lte: STOCK_ALERT_THRESHOLD }
      };
      if (shopId) {
        matchStage.shopId = mongoose.Types.ObjectId(shopId);
      }

      const lowStockItems = await Inventory.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'restockrequests',
            let: { shopId: '$shopId', productId: '$productId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$shopId', '$$shopId'] },
                      { $eq: ['$productId', '$$productId'] },
                      { $eq: ['$status', 'pending'] }
                    ]
                  }
                }
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 }
            ],
            as: 'pendingRequest'
          }
        },
        {
          $unwind: {
            path: '$pendingRequest',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'shops',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shop'
          }
        },
        {
          $unwind: {
            path: '$shop',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: {
            path: '$product',
            preserveNullAndEmptyArrays: true
          }
        },
        { $sort: { quantity: 1 } }
      ]);

      const enhancedAlerts = await Promise.all(
        lowStockItems.map(async (item) => {
          const recentTransactions = await StockLedger.find({
            shopId: item.shopId,
            productId: item.productId
          })
            .sort('-transactionDate')
            .limit(5);

          return {
            ...item,
            shopId: item.shop,
            productId: item.product,
            pendingRequestQty: item.pendingRequest?.requestedQty ?? null,
            pendingRequestDate: item.pendingRequest?.createdAt ?? null,
            pendingRequestStatus: item.pendingRequest?.status ?? null,
            pendingRequestId: item.pendingRequest?._id ?? null,
            alertStatus:
              item.quantity === 0
                ? 'OUT_OF_STOCK'
                : item.quantity <= 5
                ? 'CRITICAL'
                : 'LOW',
            recentTransactions
          };
        })
      );

      responseHelper.success(
        res,
        enhancedAlerts,
        `Found ${enhancedAlerts.length} products with low stock (≤ ${STOCK_ALERT_THRESHOLD} units)`
      );
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      responseHelper.error(res, 'Failed to fetch stock alerts', 500);
    }
  },

  getAlertCount: async (req, res) => {
    try {
      const { shopId } = req.query;

      let query = { quantity: { $lte: STOCK_ALERT_THRESHOLD } };
      if (shopId) {
        query.shopId = shopId;
      }

      const criticalCount = await Inventory.countDocuments({
        quantity: { $lte: 5 }
      });

      const lowCount = await Inventory.countDocuments({
        quantity: { $gt: 5, $lte: STOCK_ALERT_THRESHOLD }
      });

      const totalAlerts = await Inventory.countDocuments(query);

      responseHelper.success(
        res,
        {
          totalAlerts,
          criticalCount,
          lowCount,
          threshold: STOCK_ALERT_THRESHOLD
        },
        'Alert counts fetched successfully'
      );
    } catch (error) {
      console.error('Error fetching alert count:', error);
      responseHelper.error(res, 'Failed to fetch alert count', 500);
    }
  },

  getStockReport: async (req, res) => {
    try {
      const shops = await Shop.find({ isActive: true }).select('_id name location ownerName');

      const report = await Promise.all(
        shops.map(async (shop) => {
          const inventory = await Inventory.find({ shopId: shop._id })
            .populate('productId', 'name sku category price unit')
            .sort('-quantity');

          const lowStockProducts = inventory.filter(
            (item) => item.quantity <= STOCK_ALERT_THRESHOLD
          );

          const totalValue = inventory.reduce(
            (sum, item) =>
              sum + ((item.productId?.price || 0) * (item.quantity || 0)),
            0
          );

          const lowStockValue = lowStockProducts.reduce(
            (sum, item) =>
              sum + ((item.productId?.price || 0) * (item.quantity || 0)),
            0
          );

          return {
            shop: {
              _id: shop._id,
              name: shop.name,
              location: shop.location,
              ownerName: shop.ownerName
            },
            totalProducts: inventory.length,
            totalStock: inventory.reduce((sum, item) => sum + item.quantity, 0),
            totalValue,
            lowStockProducts: lowStockProducts.length,
            lowStockValue,
            alertPercentage: (
              (lowStockProducts.length / inventory.length) *
              100
            ).toFixed(2),
            products: inventory
          };
        })
      );

      responseHelper.success(res, report, 'Stock report generated successfully');
    } catch (error) {
      console.error('Error generating stock report:', error);
      responseHelper.error(res, 'Failed to generate stock report', 500);
    }
  },

  createLedgerEntry: async (req, res) => {
    try {
      const {
        shopId,
        productId,
        transactionType,
        quantity,
        referenceId,
        referenceType,
        notes
      } = req.body;

      if (!shopId || !productId || !transactionType || !quantity) {
        return responseHelper.error(
          res,
          'ShopId, ProductId, TransactionType, and Quantity are required',
          400
        );
      }

      // Verify shop and product exist
      const shop = await Shop.findById(shopId);
      const product = await Product.findById(productId);

      if (!shop || !product) {
        return responseHelper.error(res, 'Shop or Product not found', 404);
      }

      // Create ledger entry
      const ledgerEntry = new StockLedger({
        shopId,
        productId,
        transactionType,
        quantity,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        notes: notes || ''
      });

      await ledgerEntry.save();

      // Check if stock is now low and return alert status
      const inventory = await Inventory.findOne({ shopId, productId });
      const isLowStock =
        inventory && inventory.quantity <= STOCK_ALERT_THRESHOLD;

      responseHelper.success(
        res,
        {
          ledgerEntry,
          isLowStock,
          currentStock: inventory?.quantity || 0,
          alertThreshold: STOCK_ALERT_THRESHOLD
        },
        'Ledger entry created successfully',
        201
      );
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      responseHelper.error(res, 'Failed to create ledger entry', 500);
    }
  },

  // NEW Restock Requests
  createRestockRequest: async (req, res) => {
    try {
      const { productId, requestedQty, notes } = req.body;
      const shopId = req.user.shopId;

      if (!productId || !requestedQty || requestedQty < 1) {
        return responseHelper.error(res, 'Valid productId and requestedQty required', 400);
      }

      const product = await Product.findById(productId);
      const inventory = await Inventory.findOne({ shopId, productId });

      if (!product) return responseHelper.error(res, 'Product not found', 404);
      if (!inventory) return responseHelper.error(res, 'No inventory for this product', 404);

      const existingOpenRequest = await RestockRequest.findOne({
        shopId,
        productId,
        status: { $in: ['pending', 'approved'] }
      }).sort('-createdAt');

      if (existingOpenRequest) {
        const isOldPending =
          existingOpenRequest.status === 'pending' &&
          Date.now() - existingOpenRequest.createdAt.getTime() > 24 * 60 * 60 * 1000;

        if (!isOldPending) {
          return responseHelper.error(
            res,
            'A restock request for this product is already open. Please wait for admin action before sending another request.',
            409
          );
        }
      }

      const request = new RestockRequest({
        shopId,
        productId,
        currentQty: inventory.quantity,
        requestedQty,
        notes: notes || ''
      });

      await request.save();
      await request.populate('shopId productId', 'name location sku category price unit');

      responseHelper.success(res, request, 'Restock request submitted', 201);
    } catch (error) {
      console.error('Error creating restock request:', error);
      responseHelper.error(res, 'Failed to create request', 500);
    }
  },

  getRestockRequests: async (req, res) => {
    try {
      const { status, shopId } = req.query;
      let query = { status: { $ne: 'fulfilled' } };

      if (status) query.status = status;
      if (shopId) query.shopId = shopId;

      const requests = await RestockRequest.find(query)
        .populate('shopId', 'name location ownerName')
        .populate('productId', 'name sku category price unit')
        .sort('-createdAt');

      responseHelper.success(res, requests, 'Requests fetched');
    } catch (error) {
      console.error('Error fetching requests:', error);
      responseHelper.error(res, 'Failed to fetch requests', 500);
    }
  },

  updateRestockRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!id || !status) {
        return responseHelper.error(res, 'Request ID and status are required', 400);
      }

      const request = await RestockRequest.findById(id);
      if (!request) {
        console.error(`RestockRequest not found: ${id}`);
        return responseHelper.error(res, 'Request not found', 404);
      }

      const previousStatus = request.status;
      request.status = status;
      if (notes) request.notes = notes;
      request.resolvedBy = req.user._id;
      
      const savedRequest = await request.save();
      console.log(`RestockRequest ${id} status updated from ${previousStatus} to ${status}`);

      await request.populate('shopId productId resolvedBy', 'name location ownerName');

      responseHelper.success(res, request, `Request ${status} successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      responseHelper.error(res, 'Failed to update request', 500);
    }
  },

  getRestockRequestsCount: async (req, res) => {
    try {
      const pendingCount = await RestockRequest.countDocuments({ status: 'pending' });
      const totalCount = await RestockRequest.countDocuments({ status: { $ne: 'fulfilled' } });

      responseHelper.success(res, { pendingCount, totalCount }, 'Counts fetched');
    } catch (error) {
      console.error('Error fetching count:', error);
      responseHelper.error(res, 'Failed to fetch count', 500);
    }
  }
};

