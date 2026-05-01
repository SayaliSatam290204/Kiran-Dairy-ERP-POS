import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
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
    baseSalary: {
      type: Number,
      required: true,
      description: 'Monthly base salary'
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
      default: 0,
      description: 'Total amount of money the staff member owes the company as advance'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Staff', staffSchema);
