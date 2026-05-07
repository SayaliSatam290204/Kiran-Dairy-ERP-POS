## SUPER ADMIN DASHBOARD 500 ERROR FIX

**Error**: `/api/super-admin/dashboard` → 500 Internal Server Error
**Cause**: Aggregation pipeline in `superAdminDashboardService.js`

**Plan**:
1. **Read service** → Identify failing aggregation
2. **Fix ObjectId validation** for `selectedBranches` 
3. **Add aggregation error handling**
4. **Test endpoint** → Verify data loads

**Status**: Ready to fix service file

**Next**: Create fixed service → restart server → test dashboard
