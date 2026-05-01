// Script to update staff names to include branch/location for uniqueness
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

// Shop Schema
const shopSchema = new mongoose.Schema({
  name: String,
  location: String,
  address: String,
  phone: String,
  email: String,
  isActive: Boolean
});

const Staff = mongoose.model('Staff', staffSchema, 'staffs');
const Shop = mongoose.model('Shop', shopSchema, 'shops');

async function updateStaffNames() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all shops first
    const shops = await Shop.find({});
    const shopMap = {};
    shops.forEach(shop => {
      shopMap[shop._id.toString()] = shop.name;
    });
    
    console.log(`Found ${shops.length} shops`);
    
    // Get all staff
    const allStaff = await Staff.find({}).populate('shopId', 'name');
    
    console.log(`Found ${allStaff.length} staff members`);
    
    let updated = 0;
    
    // Update each staff name to include branch name
    for (const staff of allStaff) {
      const shopName = staff.shopId ? staff.shopId.name : 'Unknown';
      
      // Extract the base name (e.g., "Vijay P.", "Priya S.", etc.)
      const baseName = staff.name.split(' - ')[0];
      
      // Create new name with branch
      const newName = `${baseName} - ${shopName}`;
      
      if (staff.name !== newName) {
        await Staff.updateOne({ _id: staff._id }, { name: newName });
        console.log(`Updated: ${staff.name} -> ${newName}`);
        updated++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} staff names!`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateStaffNames();
