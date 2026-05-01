// Script to delete a staff member and ALL their payment history
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";

// Staff Schema
const staffSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shifts: [String],
  baseSalary: Number,
  status: String,
  joinDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  isActive: Boolean,
  advanceBalance: Number
});

// StaffPayment Schema
const staffPaymentSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  amount: Number,
  paymentDate: Date,
  paymentMethod: String,
  status: String,
  paymentPeriod: {
    startDate: Date,
    endDate: Date
  },
  month: String,
  notes: String,
  isAdvance: Boolean,
  advanceAmount: Number,
  deductionAmount: Number,
  previousAdvanceBalance: Number,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Staff = mongoose.model('Staff', staffSchema, 'staffs');
const StaffPayment = mongoose.model('StaffPayment', staffPaymentSchema, 'staffpayments');

async function deleteStaffAndPayments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Change this email to delete any staff member
    const emailToDelete = 'vijayp.-69f22265c66b86568472be4d@staff.local';
    
    // First find the staff
    const staffMember = await Staff.findOne({ email: emailToDelete });
    
    if (!staffMember) {
      console.log(`Staff member with email ${emailToDelete} not found`);
      await mongoose.disconnect();
      process.exit(0);
    }
    
    console.log(`Found staff: ${staffMember.name} (ID: ${staffMember._id})`);
    
    // Step 1: Delete all payment records for this staff
    const paymentResult = await StaffPayment.deleteMany({ staffId: staffMember._id });
    console.log(`Deleted ${paymentResult.deletedCount} payment records`);
    
    // Step 2: Delete the staff member
    const staffResult = await Staff.deleteOne({ _id: staffMember._id });
    console.log(`Deleted ${staffResult.deletedCount} staff member`);
    
    console.log(`\n✅ Successfully deleted ${staffMember.name} and all their payment history!`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteStaffAndPayments();
