import mongoose from 'mongoose';

const staffPaymentSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'online'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentPeriod: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      }
    },
    month: {
      type: String,
      required: true
    },
notes: {
      type: String,
      default: ''
    },
    isAdvance: {
      type: Boolean,
      default: false,
      description: 'Flag to distinguish between regular salary payment and advance payout'
    },
    advanceAmount: {
      type: Number,
      default: 0,
      description: 'Amount of advance given in this transaction (if isAdvance is true)'
    },
    deductionAmount: {
      type: Number,
      default: 0,
      description: 'Amount deducted from this payment to repay previous advance'
    },
    previousAdvanceBalance: {
      type: Number,
      default: 0,
      description: 'Staff advance balance before this payment was processed'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Index for efficient querying
staffPaymentSchema.index({ staffId: 1, paymentDate: -1 });
staffPaymentSchema.index({ shopId: 1, paymentDate: -1 });
staffPaymentSchema.index({ month: 1, shopId: 1 });

export default mongoose.model('StaffPayment', staffPaymentSchema);
