# TODO - Advance Payment & Automatic Deduction Logic

## Implementation Plan

- [x] 1. Update models/Staff.js - Add advanceBalance field
- [x] 2. Update models/StaffPayment.js - Add isAdvance, advanceAmount, deductionAmount, previousAdvanceBalance fields
- [x] 3. Update controllers/staffPaymentController.js - Implement advance & deduction logic + filter N/A
- [x] 4. Update controllers/staffController.js - Delete payments when staff is deleted
- [x] 5. Update pages/admin/StaffPayment.jsx - Add isAdvance checkbox, Net Payout calc, Deductions column

## Status
- COMPLETE
