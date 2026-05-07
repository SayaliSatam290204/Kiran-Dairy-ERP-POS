import express from 'express';
import { dispatchController } from '../controllers/dispatchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Dispatch routes
router.get('/', authMiddleware, dispatchController.getAll);
router.get('/analytics', authMiddleware, dispatchController.getAnalytics);
router.get('/shop/:shopId', authMiddleware, dispatchController.getByShop);
router.get('/:id', authMiddleware, dispatchController.getById);
router.post('/', authMiddleware, dispatchController.create);
router.put('/:id/status', authMiddleware, dispatchController.updateStatus);

router.post('/discrepancy', authMiddleware, roleMiddleware(['shop']), dispatchController.createDiscrepancy);
router.patch('/discrepancy/:id/resolve', authMiddleware, roleMiddleware(['admin', 'super-admin']), dispatchController.resolveDiscrepancy);
router.get('/discrepancies/pending', authMiddleware, dispatchController.getPendingDiscrepancies);

export default router;
