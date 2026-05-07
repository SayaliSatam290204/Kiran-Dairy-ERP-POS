import StockDiscrepancy from '../models/StockDiscrepancy.js';
import Dispatch from '../models/Dispatch.js';
import { inventoryService } from '../services/inventoryService.js';
import { responseHelper } from '../utils/responseHelper.js';

export const discrepancyController = {
  // Shop creates discrepancy report
  createDiscrepancy: async (req, res) => {
    try {
      const { dispatchId, items } = req.body;
      const shopId = req.user.shopId || req.user.shop._id; // From auth context

      if (!dispatchId || !items || items.length === 0) {
        return responseHelper.error(res, 'Dispatch ID and items required', 400);
      }

      // Verify dispatch belongs to shop
      const dispatch = await Dispatch.findById(dispatchId).populate('shopId');
      if (!dispatch || (dispatch.shopId._id.toString() !== shopId.toString() && !dispatch.shopIds?.some(s => s.toString() === shopId.toString()))) {
        return responseHelper.error(res, 'Dispatch not found or unauthorized', 404);
      }

      // Create discrepancy
      const discrepancyData = {
        shopId,
        dispatchId,
        items: items.map(item => ({
          productId: item.productId,
          expectedQty: item.expectedQty,
          receivedQty: item.receivedQty
        })),
        status: 'pending'
      };

      const discrepancy = new StockDiscrepancy(discrepancyData);
      await discrepancy.save();

      // Update dispatch status to 'pending' if not already
      if (dispatch.status === 'received') {
        dispatch.status = 'pending';
        await dispatch.save();
      }

      await discrepancy.populate('dispatchId shopId items.productId');
      responseHelper.success(res, discrepancy, 'Discrepancy reported successfully', 201);
    } catch (error) {
      console.error('Error creating discrepancy:', error);
      responseHelper.error(res, 'Failed to create discrepancy', 500);
    }
  },

  // Admin resolves discrepancy
  resolveDiscrepancy: async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const discrepancy = await StockDiscrepancy.findById(id).populate('shopId dispatchId items.productId');
      if (!discrepancy) {
        return responseHelper.error(res, 'Discrepancy not found', 404);
      }

      // Only admin can resolve
      if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        return responseHelper.error(res, 'Admin access required', 403);
      }

      discrepancy.status = 'resolved';
      if (adminNotes) {
        discrepancy.adminNotes = adminNotes;
      }
      await discrepancy.save();

      // Update dispatch status to 'received'
      const dispatch = await Dispatch.findById(discrepancy.dispatchId);
      if (dispatch) {
        dispatch.status = 'received';
        await dispatch.save();
      }

      // Adjust inventory for discrepancies
      for (const item of discrepancy.items) {
        const diff = item.receivedQty - item.expectedQty;
        if (diff !== 0) {
          await inventoryService.updateInventory(
            discrepancy.shopId,
            item.productId,
            diff,
            'discrepancy_adjust',
            id
          );
        }
      }

      await discrepancy.populate('dispatchId shopId items.productId');
      responseHelper.success(res, discrepancy, 'Discrepancy resolved successfully');
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
      responseHelper.error(res, 'Failed to resolve discrepancy', 500);
    }
  },

  getPendingDiscrepancies: async (req, res) => {
    try {
      const discrepancies = await StockDiscrepancy.find({ status: 'pending' })
        .populate('shopId', 'name location')
        .populate('dispatchId', 'dispatchNo dispatchDate')
        .populate('items.productId', 'name sku')
        .sort({ createdAt: -1 });

      responseHelper.success(res, discrepancies, 'Pending discrepancies fetched');
    } catch (error) {
      console.error('Error fetching discrepancies:', error);
      responseHelper.error(res, 'Failed to fetch discrepancies', 500);
    }
  }
};

