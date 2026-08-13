import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Public routes for testing payment from Landing page
router.post('/orders', createOrder);
router.post('/verify', verifyPayment);

export default router;
