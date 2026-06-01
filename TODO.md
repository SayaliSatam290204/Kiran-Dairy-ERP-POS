# TODO

## Returns row inconsistency fix (RET/000001)
- [ ] Enforce Return schema integrity in `server/src/models/Return.js`:
  - [ ] Validate `items` is required and non-empty
  - [ ] Ensure `totalRefund` is recomputed from `items` (and `saleId` prices when present)
  - [ ] Add defaults/min constraints for `quantity` and `reason` enum
- [ ] Update any frontend rendering helpers if needed (admin + shop returns tables)
- [ ] Run lint / quick sanity check


