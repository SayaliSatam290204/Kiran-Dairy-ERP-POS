// Script to delete a staff member by email
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://swaroopjadhav6161_db_user:07qlLah01qO02wq2@cluster0.jntv8qo.mongodb.net/?appName=Cluster0";

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

const Staff = mongoose.model('Staff', staffSchema, 'staffs');

async function deleteStaff() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const emailToDelete = 'rajesh123@gmail.com';
    
    const result = await Staff.deleteOne({ email: emailToDelete });
    console.log(`Deleted ${result.deletedCount} staff member(s) with email: ${emailToDelete}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteStaff();
