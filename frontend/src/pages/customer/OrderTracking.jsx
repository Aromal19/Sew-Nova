import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { getCurrentUser } from '../../utils/api';
import { adminApiService } from '../../services/adminApiService';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const DELIVERY_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:3008';

const VENDOR_STEPS = ['Pending', 'Packed', 'Dispatched', 'In Transit', 'Delivered to Tailor'];
const TAILOR_STEPS = ['Waiting for Fabric', 'In Production', 'Quality Check', 'Out for Delivery', 'Delivered'];

const UNIFIED_TIMELINE = [
  { label: 'Order Placed',         icon: '📝' }, // 0: Pending
  { label: 'Fabric Packed',        icon: '📦' }, // 1: Packed
  { label: 'Fabric Dispatched',    icon: '🏁' }, // 2: Dispatched
  { label: 'Fabric in Transit',    icon: '🚚' }, // 3: In Transit
  { label: 'Fabric at Tailor',     icon: '📍' }, // 4: Delivered to Tailor
  { label: 'Garment In Production',icon: '✂️' }, // 5: In Production
  { label: 'Quality Check',        icon: '📏' }, // 6: Quality Check
  { label: 'Out for Delivery',     icon: '🛵' }, // 7: Out for Delivery
  { label: 'Delivered',            icon: '🎁' }  // 8: Delivered
];

const OVERALL_COLORS = {
  'Processing':       'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Confirmed':        'bg-blue-100 text-blue-800 border-blue-300',
  'Fabric Shipped':   'bg-blue-100 text-blue-800 border-blue-300',
  'In Production':    'bg-purple-100 text-purple-800 border-purple-300',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Completed':        'bg-green-100 text-green-800 border-green-300',
  'Cancelled':        'bg-red-100 text-red-800 border-red-300',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day(s) ago`;
}

function UnifiedStepItem({ label, stepIdx, currentIdx, isLast, comment, icon }) {
  const isPast    = stepIdx < currentIdx;
  const isCurrent = stepIdx === currentIdx;
  const isFuture  = stepIdx > currentIdx;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          transition-all duration-500 z-10
          ${isPast    ? 'bg-green-500 text-white shadow-md shadow-green-200' : ''}
          ${isCurrent ? 'bg-purple-600 text-white shadow-lg shadow-purple-300 ring-4 ring-purple-200 animate-pulse' : ''}
          ${isFuture  ? 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400' : ''}
        `}>
          {isPast ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          ) : icon ? (
            <span className={`text-base ${isFuture ? 'opacity-50 grayscale' : ''}`}>{icon}</span>
          ) : (
             stepIdx + 1
          )}
        </div>
        {!isLast && (
          <div className="flex-1 w-1 min-h-[56px] -my-2 relative overflow-hidden bg-gray-100">
            <div className={`absolute inset-0 transition-transform duration-[1000ms] ${
              isPast ? 'bg-green-400 origin-top scale-y-100' : 
              'origin-top scale-y-0'
            }`} />
          </div>
        )}
      </div>

      <div className={`pb-10 ${isLast ? 'pb-2' : ''} ${isFuture ? 'opacity-50' : ''} transition-opacity duration-300 pt-1`}>
        <p className={`text-lg font-bold leading-tight
          ${isPast    ? 'text-gray-900' : ''}
          ${isCurrent ? 'text-purple-700 text-xl' : ''}
          ${isFuture  ? 'text-gray-400' : ''}
        `}>
          {label}
        </p>
        
        {/* Comment Bubble (only for current step) */}
        {isCurrent && comment && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-medium text-purple-900 shadow-sm inline-block max-w-sm relative">
             <div className="absolute -left-2 top-4 w-4 h-4 bg-purple-50 border-l border-b border-purple-200 transform rotate-45"></div>
            <span className="mr-2 opacity-80">💬</span> {comment}
          </div>
        )}
      </div>
    </div>
  );
}

const OrderTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState([]);
  
  const queryParams = new URLSearchParams(location.search);
  const initialOrderId = queryParams.get('orderId');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
  
  const [delivery, setDelivery] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  useEffect(() => {
    loadCustomerOrders();
  }, []);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const user = getCurrentUser();
      const customerId = user?._id || user?.id || user?.userId;

      const response = await adminApiService.getAllOrders({
        page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc'
      });

      if (response.success) {
        const allOrders = response.data.bookings || response.bookings || [];
        const customerOrders = allOrders.filter(o => 
          o.customerId?._id === customerId || o.customerId === customerId
        );
        
        setOrders(customerOrders);
        if (customerOrders.length > 0 && !selectedOrderId) {
          setSelectedOrderId(customerOrders[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      window.history.replaceState(null, '', `?orderId=${selectedOrderId}`);
      fetchTracking(selectedOrderId);
    } else {
      setDelivery(null);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    let interval;
    if (selectedOrderId) {
      interval = setInterval(() => fetchTracking(selectedOrderId, false), 15000);
    }
    return () => { if (interval) clearInterval(interval); }
  }, [selectedOrderId]);

  const fetchTracking = async (orderId, showLoader = true) => {
    if (showLoader) setLoadingTracking(true);
    setError(null);
    try {
      const res = await axios.get(`${DELIVERY_URL}/api/deliveries/track/${orderId}`);
      if (res.data.success) {
        setDelivery(res.data.delivery);
        setLastFetched(new Date());
      } else {
        // If API fails cleanly but no delivery is found via data message
        setDelivery({
           isShell: true,
           vendorToTailor: { status: 'Pending' },
           tailorToCustomer: { status: 'Waiting for Fabric' },
           overallStatus: 'Processing'
        });
      }
    } catch (err) {
      // Create an automatic shell/default delivery state instead of a scary red error!
      setDelivery({
         isShell: true,
         vendorToTailor: { status: 'Pending' },
         tailorToCustomer: { status: 'Waiting for Fabric' },
         overallStatus: 'Processing'
      });
    } finally {
      if (showLoader) setLoadingTracking(false);
    }
  };

  /* ── Compute Unified Index ────────────────────────────────────── */
  const vendorStatus = delivery?.vendorToTailor?.status || 'Pending';
  const tailorStatus = delivery?.tailorToCustomer?.status || 'Waiting for Fabric';

  const vendorIdx = VENDOR_STEPS.indexOf(vendorStatus);
  const tailorIdx = TAILOR_STEPS.indexOf(tailorStatus);

  // If tailor has moved past "Waiting for Fabric", they take over the timeline (index 4 + tailorIdx)
  // Else, the vendor is in control of the timeline (index 0 to 4)
  const selectedOrderObj = orders.find(o => o._id === selectedOrderId);
  
  // Smart Fallback for Legacy Orders: 
  // If the delivery record is missing/shell, use the master Booking status to drive the UI.
  let unifiedIdx = tailorIdx >= 1 ? (4 + tailorIdx) : Math.max(0, vendorIdx);
  let overallStatus = delivery?.overallStatus || 'Processing';

  if (selectedOrderObj?.status === 'completed' || selectedOrderObj?.status === 'delivered') {
      unifiedIdx = 8; // Force all steps as green
      overallStatus = 'Completed';
  } else if (selectedOrderObj?.status === 'cancelled') {
      overallStatus = 'Cancelled';
  } else if (selectedOrderObj?.status === 'confirmed' && overallStatus === 'Processing') {
      overallStatus = 'Confirmed';
  }

  // Determine current comment if any
  let currentComment = null;
  if (tailorIdx >= 1) currentComment = delivery?.tailorToCustomer?.currentComment;
  else currentComment = delivery?.vendorToTailor?.currentComment;

  return (
    <div className="min-h-screen flex bg-gray-50/50 font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="tracking" />
      
      <main className="flex-1 p-4 sm:p-8 lg:p-12 transition-all duration-300 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Order Tracking</h1>
          <p className="text-gray-500 mt-2 text-lg">Your entire garment journey in one seamless timeline.</p>
        </div>

        {/* Order Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            {loadingOrders ? (
              <div className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm">Loading your orders...</div>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-medium text-gray-800 outline-none transition-all shadow-sm cursor-pointer appearance-none text-base"
              >
                <option value="" disabled>-- Select an order to track --</option>
                {orders.map(order => (
                  <option key={order._id} value={order._id}>
                    Order #{order._id.substring(0, 8).toUpperCase()} — {order.orderDetails?.garmentType?.toUpperCase() || 'Custom'} ({order.status})
                  </option>
                ))}
              </select>
            )}
            {!loadingOrders && <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>}
          </div>
          
          <button
            onClick={() => selectedOrderId && fetchTracking(selectedOrderId, true)}
            disabled={!selectedOrderId || loadingTracking}
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 border border-transparent text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${loadingTracking ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Tracking Content ──────────────────────────────────────── */}
        {selectedOrderId && (
          loadingTracking && !delivery ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin mb-6 shadow-inner" />
              <p className="text-gray-500 font-medium text-lg tracking-wide animate-pulse">Retrieving live tracking data...</p>
            </div>
          ) : delivery ? (
            <div className="space-y-6 animate-fadeIn">

              {/* Status Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-gray-500 border border-gray-200 bg-gray-50 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                      ID: {selectedOrderId.substring(0, 10).toUpperCase()}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold border shadow-sm tracking-wide uppercase ${OVERALL_COLORS[overallStatus] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {overallStatus}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
                    {selectedOrderObj?.orderDetails?.garmentType?.toUpperCase() || 'Custom Garment Package'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 font-medium">
                    {delivery.isShell ? 'Shipment initialization pending.' : lastFetched ? `Sync completed ${timeAgo(lastFetched)}` : ''}
                  </p>
                </div>

                <div className="flex gap-8 bg-gray-50 p-5 rounded-2xl border border-gray-100 min-w-[280px]">
                  {delivery.vendorName && (
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Fabric Vendor</p>
                      <p className="font-bold text-gray-900">{delivery.vendorName}</p>
                    </div>
                  )}
                  {delivery.tailorName && (
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Assigned Tailor</p>
                      <p className="font-bold text-gray-900">{delivery.tailorName}</p>
                    </div>
                  )}
                  {(!delivery.vendorName && !delivery.tailorName) && (
                     <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div>
                          <p className="h-2 w-16 bg-gray-200 rounded mb-2 animate-pulse"></p>
                          <p className="h-3 w-24 bg-gray-200 rounded animate-pulse"></p>
                        </div>
                     </div>
                  )}
                </div>
              </div>

              {/* ── UNIFIED TIMELINE ────────────────────────────── */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative pt-6 text-charcoal">
                <div className="absolute top-8 right-8 text-8xl opacity-[0.03] grayscale pointer-events-none">🚚</div>
                <div className="px-10 py-10 relative z-10">
                  {UNIFIED_TIMELINE.map((step, i) => (
                    <UnifiedStepItem
                      key={step.label}
                      label={step.label}
                      stepIdx={i}
                      currentIdx={unifiedIdx}
                      isLast={i === UNIFIED_TIMELINE.length - 1}
                      comment={i === unifiedIdx ? currentComment : null}
                      icon={step.icon}
                    />
                  ))}
                </div>
              </div>

            </div>
          ) : null
        )}
      </main>
    </div>
  );
};

export default OrderTracking;
