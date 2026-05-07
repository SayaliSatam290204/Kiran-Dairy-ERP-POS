import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import db from '../config/db.js';

async function migrateShopPrices() {
  await db();
  
  console.log('Starting Product.shopPrices migration...');
  
  // Step 1: Get all products without shopPrices
  const products = await Product.find({ shopPrices: { $exists: false } });
  console.log(`Found ${products.length} products needing migration`);
  
  // Step 2: Get all active shops
  const shops = await Shop.find({ isActive: true });
  console.log(`Found ${shops.length} active shops`);
  
  // Step 3: Update each product with empty shopPrices array
  const updated = await Product.updateMany(
    { shopPrices: { $exists: false } },
    { $set: { shopPrices: [] } }
  );
  
  console.log(`Updated ${updated.modifiedCount} products with empty shopPrices array`);
  
  console.log('Migration complete! Future shop-specific pricing can be set via admin UI.');
  process.exit(0);
}

migrateShopPrices().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

