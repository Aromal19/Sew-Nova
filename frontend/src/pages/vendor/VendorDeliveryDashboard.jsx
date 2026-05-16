import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { adminApiService } from '../../services/adminApiService';

const DELIVERY_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:3008';

const VENDOR_STEPS = ['Pending', 'Packed', 'Dispatched', 'In Transit', 'Delivered to Tailor'];

const STATUS_BADGE = {
  'Pending':              'bg-gray-100 text-gray-800',
  'Packed':               'bg-blue-100 text-blue-800',
  'Dispatched':           'bg-orange-100 text-orange-800',
  'In Transit':           'bg-yellow-100 text-yellow-800 animate-pulse',
  'Delivered to Tailor':  'bg-green-100 text-green-800',
};

const OVERALL_BADGE = {
  'Processing':       'bg-yellow-100 text-yellow-800',
  'Fabric Shipped':   'bg-blue-100 text-blue-800',
  'In Production':    'bg-purple-100 text-purple-800',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800',
  'Completed':        'bg-green-100 text-green-800',
};

// Vendor can only set Packed and Dispatched.
function getNextStatus(current) {
  if (current === 'Pending') return 'Packed';
  if (current === 'Packed') return 'Dispatched';
  return null;
}

function getVendorName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.businessName) return user.businessName;
    if (user.firstname) return `${user.firstname} ${user.lastname || ''}`.trim();
    if (user.email) return user.email.split('@')[0];
    return 'all'; // demo fallback — show all
  } catch { return 'all'; }
}

/* ══════════════════════════════════════════════════════════════════ */
export default function VendorDeliveryDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [expandedId, setExpandedId]   = useState(null);
  const [comment, setComment]         = useState('');
  const [updating, setUpdating]       = useState(false);
  const [toast, setToast]             = useState(null);

  const vendorName = getVendorName();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApiService.getAllOrders({ limit: 500 });
      let bookings = response.data?.bookings || response.bookings || response.data || [];
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;

      const resolvedBookings = await Promise.all(bookings.map(async (b) => {
        if (b.bookingType === 'tailor') return b; 
        
        if (!b.fabricDetails && b.fabricId) {
          try {
            const baseUrl = import.meta.env.VITE_SELLER_SERVICE_URL || 'http://localhost:3006';
            const fabricRes = await axios.get(`${baseUrl}/api/public/products/${b.fabricId}?includeInactive=true`);
            if (fabricRes.data?.success && fabricRes.data?.data) {
              const cloth = fabricRes.data.data;
              b.fabricDetails = {
                 ...cloth,
                 name: cloth.name || 'Recovered Cloth',
                 sellerId: (cloth.seller && cloth.seller._id) || cloth.sellerId 
              };
            }
          } catch (err) {
            console.log(`Could not recover fabric for booking ${b._id}:`, err.message);
          }
        }
        return b;
      }));

      const myBookings = resolvedBookings.filter(b => {
        if (b.bookingType === 'tailor') return false;
        if (!b.fabricDetails && !b.sellerId) return false;
        
        if (vendorName === 'all') return true;
        
        const orderSellerId = b.sellerId || (b.fabricDetails && (b.fabricDetails.sellerId || b.fabricDetails.seller));
        return String(orderSellerId) === String(userId);
      });

      const deliveryPromises = myBookings.map(async (b) => {
        try {
          const res = await axios.get(`${DELIVERY_URL}/api/deliveries/track/${b._id}`);
          if (res.data.success) return { booking: b, delivery: res.data.delivery };
        } catch (e) {}
        return { booking: b, delivery: null };
      });

      const results = await Promise.all(deliveryPromises);

      const formatted = results.map(({ booking, delivery }) => {
        return {
          orderId:           booking._id,
          customerName:      booking.customerEmail?.split('@')[0] || 'Customer',
          tailorName:        booking.tailorDetails?.name || 'Assigned Tailor',
          vendorName:        booking.fabricDetails?.name ? `Fabric: ${booking.fabricDetails.name}` : vendorName,
          fabricDetails:     booking.fabricDetails || null,
          orderDetails:      booking.orderDetails || null,
          vendorStatus:      delivery?.vendorToTailor?.status || 'Pending',
          tailorStatus:      delivery?.tailorToCustomer?.status || 'Waiting for Fabric',
          overallStatus:     delivery?.overallStatus || 'Processing',
          vendorHistory:     delivery?.vendorToTailor?.history || [],
          tailorHistory:     delivery?.tailorToCustomer?.history || [],
          vendorComment:     delivery?.vendorToTailor?.currentComment || '',
          createdAt:         delivery?.createdAt || booking.createdAt || new Date(),
          updatedAt:         delivery?.updatedAt || booking.updatedAt || new Date()
        };
      });

      setOrders(formatted.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
      try {
          const res = await axios.get(`${DELIVERY_URL}/api/deliveries/vendor/${encodeURIComponent(vendorName)}`);
          if (res.data.success) setOrders(res.data.deliveries || []);
      } catch (fallbackErr) {
          setError('Unable to load orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (orderId, nextStatus) => {
    setUpdating(true);
    console.log(`[VENDOR] Attempting to patch vendor-status to "${nextStatus}" for order ${orderId}`);
    try {
      const order = orders.find(o => o.orderId === orderId);
      const res = await axios.patch(`${DELIVERY_URL}/api/deliveries/${orderId}/vendor-status`, {
        status: nextStatus,
        comment,
        updatedBy: vendorName,
        vendorName,
        customerName: order?.customerName || '',
        tailorName: order?.tailorName || '',
      });
      console.log(`[VENDOR] PATCH successful:`, res.data);
      if (res.data.success) {
        showToast(`Status updated to "${nextStatus}"`);
        setComment('');
        setExpandedId(null);
        fetchOrders();
      } else {
        showToast(res.data.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error(`[VENDOR] PATCH error:`, err.response?.data);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Filtered orders ─────────────────────────────────────────── */
  const filtered = orders.filter(o => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      o.orderId?.toLowerCase().includes(t) ||
      o.customerName?.toLowerCase().includes(t) ||
      o.tailorName?.toLowerCase().includes(t)
    );
  });

  /* ── Stats ───────────────────────────────────────────────────── */
  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => ['Pending', 'Packed'].includes(o.vendorStatus)).length,
    transit:    orders.filter(o => ['Dispatched', 'In Transit'].includes(o.vendorStatus)).length,
    delivered:  orders.filter(o => o.vendorStatus === 'Delivered to Tailor').length,
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="seller" />

      <main className="flex-1 p-6 transition-all duration-300">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-bounce ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders & Shipments</h1>
          <p className="text-gray-600 mt-2">Manage fabric shipments to tailors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders',     value: stats.total,      color: 'from-purple-500 to-indigo-500',  icon: '📦' },
            { label: 'Pending Shipment', value: stats.pending,    color: 'from-yellow-500 to-orange-500',  icon: '⏳' },
            { label: 'In Transit',       value: stats.transit,    color: 'from-blue-500 to-cyan-500',      icon: '🚚' },
            { label: 'Delivered',        value: stats.delivered,  color: 'from-green-500 to-emerald-500',  icon: '✅' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-11 h-11 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-lg`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Tailor…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchOrders} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Try a different search term.' : 'Orders involving your fabrics will appear here once customers place them.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const isExpanded = expandedId === order.orderId;
              const nextStatus = getNextStatus(order.vendorStatus);
              const readOnlyLeg = ['In Transit', 'Delivered to Tailor'].includes(order.vendorStatus);

              return (
                <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                  {/* Row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          #{order.orderId?.substring(0, 10).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${OVERALL_BADGE[order.overallStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {order.overallStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Customer:</span> {order.customerName || '—'}
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="font-medium">Tailor:</span> {order.tailorName || '—'}
                      </p>
                      
                      {order.fabricDetails && (
                        <div className="mt-1 flex items-start gap-3 bg-purple-50/50 border border-purple-100/50 p-2.5 rounded-lg w-fit">
                          <span className="text-xl bg-white p-1.5 rounded shadow-sm border border-purple-100">🧵</span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{order.fabricDetails.name || 'Custom Cloth'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.orderDetails?.garmentType && <span className="uppercase tracking-wider mr-2">{order.orderDetails.garmentType.replace('-', ' ')}</span>}
                              Quantity: {order.orderDetails?.quantity || 1}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status + button */}
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[order.vendorStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.vendorStatus}
                      </span>
                      {readOnlyLeg ? (
                        <span className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium">
                          Fabric in transit — awaiting tailor confirmation
                        </span>
                      ) : nextStatus ? (
                        <button
                          onClick={() => {
                            setExpandedId(isExpanded ? null : order.orderId);
                            setComment('');
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap shadow-sm hover:shadow"
                        >
                          {isExpanded ? 'Close' : 'Update Shipment'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Expanded inline panel */}
                  {isExpanded && !readOnlyLeg && nextStatus && (
                    <div className="border-t border-gray-100 bg-gradient-to-b from-purple-50 to-white p-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Left: Status progression */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3">Shipment Progress</h4>
                          <div className="space-y-2">
                            {['Pending', 'Packed', 'Dispatched'].map((step, i) => {
                              const currentSteps = ['Pending', 'Packed', 'Dispatched'];
                              const currentIdx = currentSteps.indexOf(order.vendorStatus);
                              const isPast    = i < currentIdx;
                              const isCurrent = i === currentIdx;
                              const isNext    = i === currentIdx + 1;
                              
                              return (
                                <div key={step} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                                  isPast    ? 'bg-green-50 text-green-700' :
                                  isCurrent ? 'bg-purple-100 text-purple-800 font-semibold' :
                                  isNext    ? 'bg-purple-50 text-purple-600 border-2 border-dashed border-purple-300' :
                                              'bg-gray-50 text-gray-400'
                                }`}>
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isPast    ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-purple-600 text-white' :
                                    isNext    ? 'bg-purple-200 text-purple-700' :
                                                'bg-gray-200 text-gray-400'
                                  }`}>
                                    {isPast ? '✓' : i + 1}
                                  </span>
                                  {step}
                                  {isNext && <span className="ml-auto text-[10px] font-bold text-purple-500 uppercase">Next →</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Update form */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3">Update to: <span className="text-purple-600">{nextStatus}</span></h4>
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a comment (optional)…"
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none mb-3"
                          />
                          <button
                            onClick={() => handleUpdate(order.orderId, nextStatus)}
                            disabled={updating}
                            className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                          >
                            {updating ? 'Updating…' : `Confirm: Mark as "${nextStatus}"`}
                          </button>

                          {/* History */}
                          {order.vendorHistory?.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">History</h5>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {order.vendorHistory
                                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                  .map((h, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <span className="font-semibold text-gray-700 whitespace-nowrap">{h.status}</span>
                                      {h.comment && <span className="text-gray-500 truncate">— {h.comment}</span>}
                                      <span className="ml-auto text-gray-400 whitespace-nowrap">
                                        {new Date(h.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
