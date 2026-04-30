# Restock Request System - Complete Guide

## Understanding the "Already Open" Error

Yes, the error **"A restock request for this product is already open"** is an **intentional restriction** to prevent duplicate concurrent requests.

---

## Why This Restriction Exists

For **each Shop + Product combination**, only ONE request can be in an "open" state at a time:
- `pending` — Awaiting admin action
- `approved` — Admin has approved, preparing dispatch

This prevents:
- ❌ Shop flooding the system with multiple requests for same product
- ❌ Admin confusion about which request to fulfill
- ❌ Double-dispatching stock

---

## Request Lifecycle & Status Meanings

### 1️⃣ **PENDING**
- Shop has submitted a restock request
- Admin hasn't taken action yet
- **Status**: Open request exists → Shop **CANNOT** send new request

### 2️⃣ **APPROVED**
- Admin clicked "Quick Dispatch"
- Dispatch order was created
- Request is still "approved" (being prepared)
- **Status**: Open request exists → Shop **CANNOT** send new request

### 3️⃣ **FULFILLED**
- The dispatch was completed/received by shop
- Admin manually marked as "Fulfilled" or will auto-close after delivery
- **Status**: Request is closed → Shop **CAN** send new request

### 4️⃣ **REJECTED**
- Admin rejected the restock request (not needed)
- Request is closed
- **Status**: Request is closed → Shop **CAN** send new request

---

## Proper Admin Workflow

### Scenario: Quick Dispatch ✅
```
1. Admin sees pending request in "Shop Requests" tab
2. Admin clicks "Quick Dispatch" button
3. System:
   - Creates a Dispatch order
   - Updates request status to "approved"
   - Toast shows: "Quick dispatch created for X units to Shop"
4. When dispatch is delivered:
   - Admin clicks "Fulfill" button (NEW)
   - Request status changes to "fulfilled"
   - Shop can now send new requests ✅
```

### Scenario: Reject Request ✅
```
1. Admin sees pending request
2. Admin clicks "Reject" button
3. System:
   - Updates request status to "rejected"
   - Notifies shop (optional)
   - Shop can immediately send new requests ✅
```

---

## What Goes Wrong (Common Issues)

### Problem: Shop Gets "Already Open" Error
#### Cause 1: Quick Dispatch Status Update Failed
- Admin clicked "Quick Dispatch"
- Dispatch was created ✅
- But status update to "approved" **failed silently** ❌
- Old request still "pending" in database
- Shop blocked from sending new request

**Solution:**
1. Check browser console for errors in Admin panel
2. Check backend logs for error messages
3. Manually click "Reject" or "Fulfill" to change status
4. Or delete the stuck pending request from MongoDB

#### Cause 2: Approved Request Never Marked Fulfilled
- Admin created dispatch (status = "approved") ✅
- But never marked as "fulfilled" ❌
- Request stays "approved" forever
- Shop blocked indefinitely

**Solution:**
1. Admin must click "Fulfill" button when dispatch is delivered
2. This closes the request and unblocks future requests

#### Cause 3: 24-Hour Bypass Not Triggered
- Old request is `pending` AND less than 24 hours old
- System blocks new requests as intended
- Shop must wait OR admin must manually resolve

**Solution:**
- Admin rejects/fulfills the request, OR
- Shop waits 24+ hours (then can force-create new request)

---

## Database Status Check

To debug, check MongoDB `restockrequests` collection:

```javascript
// Find all open requests for a specific shop/product
db.restockrequests.find({
  shopId: ObjectId("..."),
  productId: ObjectId("..."),
  status: { $in: ["pending", "approved"] }
})

// Change status to unblock
db.restockrequests.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "fulfilled" } }
)
```

---

## Admin Actions in Stock Alerts Tab

### Status Badge Color Coding
- 🟡 **Yellow (Pending)**: Awaiting action
- 🟢 **Green (Approved)**: Dispatch in progress
- 🔴 **Red (Rejected)**: Closed, not fulfilled
- ⚪ **Gray (Fulfilled)**: Closed, completed

### Available Actions by Status

| Status | Quick Dispatch | Fulfill | Reject |
|--------|---|---------|--------|
| **Pending** | ✅ Available | ❌ Hidden | ✅ Available |
| **Approved** | ❌ Hidden | ✅ Available | ❌ Hidden |
| **Fulfilled** | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Rejected** | ❌ Hidden | ❌ Hidden | ❌ Hidden |

---

## Error Messages & Meanings

| Message | Meaning | Solution |
|---------|---------|----------|
| "A restock request for this product is already open" | Previous request still pending/approved | Admin must Fulfill or Reject it |
| "Quick dispatch created but failed to approve" | Dispatch created but status update failed | Manually approve or reject the request |
| "Restock request is older than 24 hours" | 24-hour bypass active, allows new request | System is working as intended |

---

## Best Practices

✅ **DO:**
- Approve + Fulfill requests promptly
- Close old requests with Reject if no longer needed
- Check browser console for errors
- Monitor pending request count

❌ **DON'T:**
- Leave requests in "Approved" state indefinitely
- Manually edit database without testing
- Assume dispatch creation = automatic fulfillment

---

## Summary

The "already open" error is **not a bug**—it's a **feature to prevent duplicates**.

To unblock shops:
1. Admin **Fulfills** completed requests (status → fulfilled)
2. Admin **Rejects** unwanted requests (status → rejected)
3. Only then can shops send new requests for that product

If requests get stuck, enhanced logging will help diagnose backend update failures.
