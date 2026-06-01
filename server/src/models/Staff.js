import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    
    // Hide salary via populate select for non-superAdmin
    baseSalary: {
      type: Number,
      required: true,
      select: false  // Hide by default
    },
    pinHash: {
      type: String,
      select: false
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    shifts: {
      type: [String],
      enum: ['morning', 'evening'],
      default: ['morning']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    joinDate: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    advanceBalance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

staffSchema.virtual('perfMetrics').get(function() {
  return {
    weeklySales: this.weeklyPerformance?.totalSales || 0,
    monthlyRevenue: this.monthlyPerformance?.totalAmount || 0,
    avgRating: this.performanceRating || 0
  };
});

export default mongoose.model('Staff', staffSchema);
