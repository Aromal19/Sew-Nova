const mongoose = require('mongoose');

// ── Status History Entry ──────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  comment:   { type: String, default: '' },
  updatedBy: { type: String, default: 'system' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// ── LEG sub-schema (used for both legs) ─────────────────────────────
const legSchema = new mongoose.Schema({
  status:         { type: String, required: true },
  history:        { type: [statusHistorySchema], default: [] },
  currentComment: { type: String, default: '' }
}, { _id: false });

// ── Main Delivery Schema ───────────────────────────────────────────
const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Human-readable names for display
  customerName:  { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  tailorName:    { type: String, default: '' },
  vendorName:    { type: String, default: '' },

  // ── LEG 1: Vendor → Tailor (fabric shipment) ──────────────────
  vendorToTailor: {
    type: legSchema,
    default: () => ({
      status: 'Pending',
      history: [],
      currentComment: ''
    })
  },

  // ── LEG 2: Tailor → Customer (finished garment) ─────────────
  tailorToCustomer: {
    type: legSchema,
    default: () => ({
      status: 'Waiting for Fabric',
      history: [],
      currentComment: ''
    })
  },

  // ── Overall order status (computed on save) ─────────────────
  overallStatus: {
    type: String,
    enum: ['Processing', 'Fabric Shipped', 'In Production', 'Out for Delivery', 'Completed'],
    default: 'Processing'
  }
}, {
  timestamps: true  // createdAt + updatedAt
});

// ── Valid status enums for each leg ──────────────────────────────
const VENDOR_STATUSES  = ['Pending', 'Packed', 'Dispatched', 'In Transit', 'Delivered to Tailor'];
const TAILOR_STATUSES  = ['Waiting for Fabric', 'In Production', 'Quality Check', 'Out for Delivery', 'Delivered'];

// ── Helper: check forward-only transition ──────────────────────
deliverySchema.statics.VENDOR_STATUSES = VENDOR_STATUSES;
deliverySchema.statics.TAILOR_STATUSES = TAILOR_STATUSES;

deliverySchema.methods.canVendorTransitionTo = function (newStatus) {
  const vStatus = this.vendorToTailor?.status || 'Pending';
  const currentIdx = VENDOR_STATUSES.indexOf(vStatus);
  const newIdx     = VENDOR_STATUSES.indexOf(newStatus);
  if (newIdx === -1) return false;           // invalid status
  return newIdx > currentIdx;                // must be strictly forward
};

deliverySchema.methods.canTailorTransitionTo = function (newStatus) {
  const tStatus = this.tailorToCustomer?.status || 'Waiting for Fabric';
  const currentIdx = TAILOR_STATUSES.indexOf(tStatus);
  const newIdx     = TAILOR_STATUSES.indexOf(newStatus);
  if (newIdx === -1) return false;
  return newIdx > currentIdx;
};

// ── Compute overallStatus from both legs ───────────────────────
deliverySchema.methods.getOverallStatus = function () {
  const v = this.vendorToTailor?.status || 'Pending';
  const t = this.tailorToCustomer?.status || 'Waiting for Fabric';

  if (t === 'Delivered')        return 'Completed';
  if (t === 'Out for Delivery') return 'Out for Delivery';
  if (v === 'Delivered to Tailor' && (t === 'In Production' || t === 'Quality Check'))
    return 'In Production';
  if (v === 'Dispatched' || v === 'In Transit')
    return 'Fabric Shipped';
  return 'Processing';
};

// ── Pre-save: auto-compute overallStatus & auto-advance Dispatched
deliverySchema.pre('save', function (next) {
  // If vendor sets status to Dispatched, immediately transition it to In Transit
  if (this.isModified('vendorToTailor.status') && this.vendorToTailor?.status === 'Dispatched') {
    this.vendorToTailor.status = 'In Transit';
    // Append 'In Transit' to history 1 second after 'Dispatched'
    if (!this.vendorToTailor.history) this.vendorToTailor.history = [];
    this.vendorToTailor.history.push({
      status: 'In Transit',
      comment: 'Package picked up by courier (System Auto-Update)',
      updatedBy: 'system',
      updatedAt: new Date(Date.now() + 1000)
    });
  }

  this.overallStatus = this.getOverallStatus();
  next();
});

// ── Legacy compat fields (kept so old routes don't crash) ──────
deliverySchema.add({
  status:         { type: String, default: 'Pending' },
  statusHistory:  { type: [statusHistorySchema], default: [] },
  currentComment: { type: String, default: '' },
  deliveryType:   { type: String, default: 'GARMENT' },
  courierName:    { type: String },
  trackingId:     { type: String },
  dispatchedAt:   { type: Date },
  deliveredAt:    { type: Date }
});

// Legacy helper for the old single-pipeline route
deliverySchema.methods.canTransitionTo = function (newStatus) {
  const OLD_STATUSES = ['Pending', 'Confirmed', 'In Production', 'In Transit', 'Out for Delivery', 'Delivered'];
  const currentIdx = OLD_STATUSES.indexOf(this.status);
  const newIdx     = OLD_STATUSES.indexOf(newStatus);
  if (newIdx === -1) return false;
  return newIdx > currentIdx;
};

module.exports = mongoose.model('Delivery', deliverySchema);
