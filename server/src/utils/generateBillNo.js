// server/src/utils/generateBillNo.js
import Sale from '../models/Sale.js';

export const generateBillNo = async () => {
  const count = await Sale.countDocuments();
  return `IN-${count + 1}`;
};