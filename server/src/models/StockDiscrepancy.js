import mongoose from 'mongoose';

const stockDiscrepancySchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispatch',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    expectedQty: {
      type: Number,
      required: true
    },
    receivedQty: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'hold', 'resolved'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('StockDiscrepancy', stockDiscrepancySchema);

