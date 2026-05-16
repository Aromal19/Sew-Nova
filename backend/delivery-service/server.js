const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3008;

// Import old routes (kept for backward compat)
let deliveryRoutes, orderDeliveryRoutes;
try { deliveryRoutes     = require('./routes/deliveryRoutes');     } catch (e) { deliveryRoutes     = express.Router(); }
try { orderDeliveryRoutes = require('./routes/orderDeliveryRoutes'); } catch (e) { orderDeliveryRoutes = express.Router(); }

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://frontend-sewnova.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Debug logging ─────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  next();
});

// ── MongoDB ───────────────────────────────────────────────────────
console.log('🔍 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Delivery Service connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Health ────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Delivery Service', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Delivery service is working', timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════════
// NEW TWO-LEG DELIVERY ROUTES
// ══════════════════════════════════════════════════════════════════
const Delivery = require('./models/delivery');

// ── Valid statuses (imported from model statics after first req) ─
const VENDOR_STATUSES = ['Pending', 'Packed', 'Dispatched', 'In Transit', 'Delivered to Tailor'];
const TAILOR_STATUSES = ['Waiting for Fabric', 'In Production', 'Quality Check', 'Out for Delivery', 'Delivered'];

// ─────────────────────────────────────────────────────────────────
// GET /api/deliveries/track/:orderId — Public tracking (both legs)
// ─────────────────────────────────────────────────────────────────
app.get('/api/deliveries/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    let delivery = await Delivery.findOne({ orderId });

    if (!delivery) {
      // PROXY LOOKUP: Even if delivery doc is missing, check the booking status 
      // This enables legacy "completed" orders to show as finished in the timeline.
      let bookingStatus = 'pending'; 
      let tailorName = '';
      let vendorName = '';
      let customerName = '';

      try {
        const http = require('http');
        const fetchBooking = () => new Promise((resolve, reject) => {
          const options = { hostname: 'localhost', port: 3003, path: `/api/bookings/${orderId}`, method: 'GET', timeout: 2000 };
          const request = http.request(options, response => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => { 
                try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
            });
          });
          request.on('error', () => resolve(null));
          request.on('timeout', () => { request.destroy(); resolve(null); });
          request.end();
        });
        
        const bookingRes = await fetchBooking();
        if (bookingRes?.success && bookingRes?.data) {
           bookingStatus = bookingRes.data.status;
           tailorName    = bookingRes.data.tailorDetails?.name || '';
           vendorName    = bookingRes.data.fabricDetails?.sellerId?.name || bookingRes.data.fabricDetails?.name || '';
           customerName  = bookingRes.data.customerId?.name || '';
        }
      } catch (err) { /* ignore proxy error, fallback to pending shell */ }

      // Smart Shell Logic
      const isCompleted = (bookingStatus === 'completed' || bookingStatus === 'delivered');
      return res.json({
        success: true,
        delivery: {
          orderId,
          customerName,
          tailorName,
          vendorName,
          vendorToTailor: {
            status: isCompleted ? 'Delivered to Tailor' : 'Pending',
            history: [],
            currentComment: isCompleted ? 'Order marked as completed.' : ''
          },
          tailorToCustomer: {
            status: isCompleted ? 'Delivered' : 'Waiting for Fabric',
            history: [],
            currentComment: ''
          },
          overallStatus: isCompleted ? 'Completed' : (bookingStatus === 'confirmed' ? 'Confirmed' : 'Processing'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      delivery: {
        orderId: delivery.orderId,
        customerName: delivery.customerName,
        customerEmail: delivery.customerEmail,
        tailorName: delivery.tailorName,
        vendorName: delivery.vendorName,
        vendorToTailor: {
          status: delivery.vendorToTailor.status,
          history: (delivery.vendorToTailor.history || [])
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
          currentComment: delivery.vendorToTailor.currentComment
        },
        tailorToCustomer: {
          status: delivery.tailorToCustomer.status,
          history: (delivery.tailorToCustomer.history || [])
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
          currentComment: delivery.tailorToCustomer.currentComment
        },
        overallStatus: delivery.overallStatus,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tracking info', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/deliveries/vendor/:vendorName — Vendor's orders list
// ─────────────────────────────────────────────────────────────────
app.get('/api/deliveries/vendor/:vendorName', async (req, res) => {
  try {
    const { vendorName } = req.params;

    // Case-insensitive match, also return ALL if vendorName is 'all' (demo mode)
    let query = {};
    if (vendorName !== 'all') {
      query = { vendorName: { $regex: new RegExp(vendorName, 'i') } };
    }

    const deliveries = await Delivery.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: deliveries.length,
      deliveries: deliveries.map(d => ({
        orderId:           d.orderId,
        customerName:      d.customerName,
        tailorName:        d.tailorName,
        vendorName:        d.vendorName,
        vendorStatus:      d.vendorToTailor?.status || 'Pending',
        tailorStatus:      d.tailorToCustomer?.status || 'Waiting for Fabric',
        overallStatus:     d.overallStatus,
        vendorHistory:     d.vendorToTailor?.history || [],
        tailorHistory:     d.tailorToCustomer?.history || [],
        vendorComment:     d.vendorToTailor?.currentComment || '',
        createdAt:         d.createdAt,
        updatedAt:         d.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching vendor deliveries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor orders', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/deliveries/tailor/:tailorName — Tailor's orders list
// ─────────────────────────────────────────────────────────────────
app.get('/api/deliveries/tailor/:tailorName', async (req, res) => {
  try {
    const { tailorName } = req.params;

    let query = {};
    if (tailorName !== 'all') {
      query = { tailorName: { $regex: new RegExp(tailorName, 'i') } };
    }

    const deliveries = await Delivery.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: deliveries.length,
      deliveries: deliveries.map(d => ({
        orderId:           d.orderId,
        customerName:      d.customerName,
        tailorName:        d.tailorName,
        vendorName:        d.vendorName,
        vendorStatus:      d.vendorToTailor?.status || 'Pending',
        tailorStatus:      d.tailorToCustomer?.status || 'Waiting for Fabric',
        overallStatus:     d.overallStatus,
        vendorHistory:     d.vendorToTailor?.history || [],
        tailorHistory:     d.tailorToCustomer?.history || [],
        tailorComment:     d.tailorToCustomer?.currentComment || '',
        createdAt:         d.createdAt,
        updatedAt:         d.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching tailor deliveries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tailor orders', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// PATCH /api/deliveries/:orderId/vendor-status — Vendor updates LEG 1
// ─────────────────────────────────────────────────────────────────
app.patch('/api/deliveries/:orderId/vendor-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, comment, updatedBy, vendorName, customerName, tailorName } = req.body;

    // VENDOR strictly can only set Pending, Packed, or Dispatched
    const ALLOWED_VENDOR_ACTIONS = ['Pending', 'Packed', 'Dispatched'];

    // Validate status
    if (!status || !ALLOWED_VENDOR_ACTIONS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid vendor status. Vendor can only set: ${ALLOWED_VENDOR_ACTIONS.join(', ')}`
      });
    }

    // Find or create (upsert)
    let delivery = await Delivery.findOne({ orderId });

    if (!delivery) {
      delivery = new Delivery({
        orderId,
        customerName:  customerName || '',
        customerEmail: '',
        tailorName:    tailorName || '',
        vendorName:    vendorName || '',
        vendorToTailor: {
          status: 'Pending',
          history: [{
            status: 'Pending',
            comment: 'Order created',
            updatedBy: 'system',
            updatedAt: new Date()
          }],
          currentComment: ''
        },
        tailorToCustomer: {
          status: 'Waiting for Fabric',
          history: [],
          currentComment: ''
        }
      });
    }

    // Update names if provided (for first-time or corrections)
    if (vendorName)   delivery.vendorName   = vendorName;
    if (customerName) delivery.customerName = customerName;
    if (tailorName)   delivery.tailorName   = tailorName;

    if (!delivery.vendorToTailor) delivery.vendorToTailor = { status: 'Pending', history: [], currentComment: '' };
    if (!delivery.tailorToCustomer) delivery.tailorToCustomer = { status: 'Waiting for Fabric', history: [], currentComment: '' };

    // Validate forward-only
    if (!delivery.canVendorTransitionTo(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition vendor status from "${delivery.vendorToTailor.status}" to "${status}". Status can only move forward.`
      });
    }

    // Update LEG 1
    // (Note: If status === 'Dispatched', the pre-save hook in the Model will auto-advance to 'In Transit')
    delivery.vendorToTailor.status = status;
    delivery.vendorToTailor.currentComment = comment || '';
    delivery.vendorToTailor.history.push({
      status,
      comment: comment || '',
      updatedBy: updatedBy || vendorName || 'vendor',
      updatedAt: new Date()
    });

    delivery.markModified('vendorToTailor');
    delivery.markModified('tailorToCustomer');
    await delivery.save();

    res.json({
      success: true,
      message: `Vendor status updated to "${status}"`,
      delivery: {
        orderId: delivery.orderId,
        vendorToTailor: delivery.vendorToTailor,
        tailorToCustomer: delivery.tailorToCustomer,
        overallStatus: delivery.overallStatus
      }
    });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor status', error: error.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// PATCH /api/deliveries/:orderId/confirm-fabric-received — Tailor confirms receipt
// ─────────────────────────────────────────────────────────────────
app.patch('/api/deliveries/:orderId/confirm-fabric-received', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tailorName, comment } = req.body;

    let delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (!delivery.vendorToTailor) delivery.vendorToTailor = { status: 'Pending', history: [], currentComment: '' };
    if (!delivery.tailorToCustomer) delivery.tailorToCustomer = { status: 'Waiting for Fabric', history: [], currentComment: '' };

    if (delivery.vendorToTailor.status !== 'In Transit') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm fabric received. Current vendor status is "${delivery.vendorToTailor.status}". Must be "In Transit".`
      });
    }

    delivery.vendorToTailor.status = 'Delivered to Tailor';
    delivery.vendorToTailor.currentComment = comment || 'Fabric verified and received by tailor';
    delivery.vendorToTailor.history.push({
      status: 'Delivered to Tailor',
      comment: comment || 'Fabric verified and received by tailor',
      updatedBy: tailorName || 'tailor',
      updatedAt: new Date()
    });

    // Auto-advance LEG 2 when fabric arrives at tailor
    if (delivery.tailorToCustomer.status === 'Waiting for Fabric') {
      delivery.tailorToCustomer.status = 'In Production';
      delivery.tailorToCustomer.currentComment = 'Fabric received from vendor. Production starting.';
      delivery.tailorToCustomer.history.push({
        status: 'In Production',
        comment: 'Fabric received from vendor. Production starting.',
        updatedBy: 'system',
        updatedAt: new Date()
      });
    }

    delivery.markModified('vendorToTailor');
    delivery.markModified('tailorToCustomer');
    await delivery.save();

    res.json({
      success: true,
      message: `Fabric confirmed received by tailor`,
      delivery: {
        orderId: delivery.orderId,
        vendorToTailor: delivery.vendorToTailor,
        tailorToCustomer: delivery.tailorToCustomer,
        overallStatus: delivery.overallStatus
      }
    });
  } catch (error) {
    console.error('Error confirming fabric received:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm fabric packet', error: error.message });
  }
});


// ─────────────────────────────────────────────────────────────────
// PATCH /api/deliveries/:orderId/tailor-status — Tailor updates LEG 2
// ─────────────────────────────────────────────────────────────────
app.patch('/api/deliveries/:orderId/tailor-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, comment, updatedBy, tailorName, customerName, vendorName } = req.body;

    // Tailor strictly can only set garment statuses post-fabric
    const ALLOWED_TAILOR_ACTIONS = ['In Production', 'Quality Check', 'Out for Delivery', 'Delivered'];

    // Validate status
    if (!status || !ALLOWED_TAILOR_ACTIONS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid garment status. Must be one of: ${ALLOWED_TAILOR_ACTIONS.join(', ')}`
      });
    }

    // Find or create
    let delivery = await Delivery.findOne({ orderId });

    if (!delivery) {
       return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (!delivery.vendorToTailor) delivery.vendorToTailor = { status: 'Pending', history: [], currentComment: '' };
    if (!delivery.tailorToCustomer) delivery.tailorToCustomer = { status: 'Waiting for Fabric', history: [], currentComment: '' };

    // Block if fabric hasn't arrived yet
    if (delivery.vendorToTailor.status !== 'Delivered to Tailor') {
      return res.status(400).json({
        success: false,
        error: 'Fabric not yet received. Cannot update garment status.'
      });
    }

    // Validate forward-only
    if (!delivery.canTailorTransitionTo(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition tailor status from "${delivery.tailorToCustomer.status}" to "${status}". Status can only move forward.`
      });
    }

    // Update LEG 2
    delivery.tailorToCustomer.status = status;
    delivery.tailorToCustomer.currentComment = comment || '';
    delivery.tailorToCustomer.history.push({
      status,
      comment: comment || '',
      updatedBy: updatedBy || tailorName || 'tailor',
      updatedAt: new Date()
    });

    delivery.markModified('vendorToTailor');
    delivery.markModified('tailorToCustomer');
    await delivery.save();

    res.json({
      success: true,
      message: `Tailor status updated to "${status}"`,
      delivery: {
        orderId: delivery.orderId,
        vendorToTailor: delivery.vendorToTailor,
        tailorToCustomer: delivery.tailorToCustomer,
        overallStatus: delivery.overallStatus
      }
    });
  } catch (error) {
    console.error('Error updating tailor status:', error);
    res.status(500).json({ success: false, message: 'Failed to update tailor status', error: error.message });
  }
});

// ── Legacy PATCH route (kept so old code doesn't break) ──────────
app.patch('/api/deliveries/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, comment, updatedBy } = req.body;
    const VALID = ['Pending', 'Confirmed', 'In Production', 'In Transit', 'Out for Delivery', 'Delivered'];
    if (!status || !VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }
    let delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      delivery = new Delivery({ orderId, deliveryType: 'GARMENT', status: 'Pending',
        statusHistory: [{ status: 'Pending', comment: 'Delivery record created', updatedBy: updatedBy || 'system', updatedAt: new Date() }]
      });
    }
    if (!delivery.canTransitionTo(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from "${delivery.status}" to "${status}".` });
    }
    delivery.status = status;
    delivery.currentComment = comment || '';
    delivery.statusHistory.push({ status, comment: comment || '', updatedBy: updatedBy || 'system', updatedAt: new Date() });
    if (status === 'Delivered') delivery.deliveredAt = new Date();
    if (status === 'In Transit') delivery.dispatchedAt = new Date();
    await delivery.save();
    res.json({ success: true, message: `Status updated to "${status}"`, delivery: { orderId: delivery.orderId, status: delivery.status, currentComment: delivery.currentComment, statusHistory: delivery.statusHistory } });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

// ── Mount legacy route files ─────────────────────────────────────
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/order-deliveries', orderDeliveryRoutes);

// ── Error handling ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Delivery Service running on port ${PORT}`);
});

module.exports = app;
