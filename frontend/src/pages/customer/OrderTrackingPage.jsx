import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
  'Fabric Shipped':   'bg-blue-100 text-blue-800 border-blue-300',
  'In Production':    'bg-purple-100 text-purple-800 border-purple-300',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Completed':        'bg-green-100 text-green-800 border-green-300',
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
    <div className="flex gap-4 sm:gap-6">
      <div className="flex flex-col items-center">
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold
          transition-all duration-500 z-10
          ${isPast    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200' : ''}
          ${isCurrent ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl shadow-purple-300 ring-4 ring-purple-100 animate-pulse' : ''}
          ${isFuture  ? 'bg-white border-2 border-dashed border-gray-300 text-gray-400' : ''}
        `}>
          {isPast ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          ) : icon ? (
            <span className={`text-base sm:text-lg ${isFuture ? 'opacity-50 grayscale' : ''}`}>{icon}</span>
          ) : (
             stepIdx + 1
          )}
        </div>
        {!isLast && (
          <div className="flex-1 w-1 sm:w-1.5 min-h-[60px] -my-2 relative overflow-hidden bg-gray-100 rounded-full">
            <div className={`absolute inset-0 transition-transform duration-[1000ms] ${
              isPast ? 'bg-gradient-to-b from-green-400 to-green-500 origin-top scale-y-100' : 
              'origin-top scale-y-0'
            }`} />
          </div>
        )}
      </div>

      <div className={`pb-12 ${isLast ? 'pb-4' : ''} ${isFuture ? 'opacity-40' : ''} transition-opacity duration-300 pt-1.5 sm:pt-2 flex-1`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className={`text-lg sm:text-2xl font-extrabold tracking-tight
            ${isPast    ? 'text-gray-900' : ''}
            ${isCurrent ? 'text-purple-800' : ''}
            ${isFuture  ? 'text-gray-400' : ''}
            `}>
            {label}
            </p>
            {isPast && label === 'Delivered' && <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Success 🎉</span>}
        </div>
        
        {isCurrent && comment && (
          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm font-semibold text-purple-900 shadow-inner w-full sm:max-w-lg relative">
             <div className="absolute -left-2 top-5 w-4 h-4 bg-purple-50 border-l border-b border-purple-100 transform rotate-45 hidden sm:block"></div>
            <span className="mr-2 opacity-80 text-lg">💬</span> {comment}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchTracking = async () => {
    try {
      setError(null);
      const res = await axios.get(`${DELIVERY_URL}/api/deliveries/track/${orderId}`);
      if (res.data.success) {
        setDelivery(res.data.delivery);
        setLastFetched(new Date());
      } else {
        setDelivery({
           isShell: true,
           vendorToTailor: { status: 'Pending' },
           tailorToCustomer: { status: 'Waiting for Fabric' },
           overallStatus: 'Processing'
        });
      }
    } catch (err) {
      setDelivery({
         isShell: true,
         vendorToTailor: { status: 'Pending' },
         tailorToCustomer: { status: 'Waiting for Fabric' },
         overallStatus: 'Processing'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); 
    return () => clearInterval(interval);
  }, [orderId]);

  /* ── Compute Unified Index ────────────────────────────────────── */
  const vendorStatus = delivery?.vendorToTailor?.status || 'Pending';
  const tailorStatus = delivery?.tailorToCustomer?.status || 'Waiting for Fabric';

  const vendorIdx = VENDOR_STEPS.indexOf(vendorStatus);
  const tailorIdx = TAILOR_STEPS.indexOf(tailorStatus);

  const unifiedIdx = tailorIdx >= 1 ? (4 + tailorIdx) : Math.max(0, vendorIdx);
  const overallStatus = delivery?.overallStatus || 'Processing';

  let currentComment = null;
  if (tailorIdx >= 1) currentComment = delivery?.tailorToCustomer?.currentComment;
  else currentComment = delivery?.vendorToTailor?.currentComment;

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading && !delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold tracking-wide animate-pulse">Initializing unified tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">SewNova Package Tracking</h1>
            <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Order <span className="text-purple-600">#{orderId?.substring(0, 8)}</span></p>
          </div>

          <div className="flex items-center gap-4">
             <span className={`px-4 py-1.5 rounded-xl text-sm font-extrabold uppercase tracking-wide border shadow-sm ${OVERALL_COLORS[overallStatus] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
              {overallStatus}
             </span>
             <button onClick={fetchTracking} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
             </button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-charcoal relative">
          
          {/* Decorative Corner Icon */}
          <div className="absolute top-8 right-8 text-8xl opacity-[0.03] grayscale pointer-events-none">📦</div>

          <div className="px-8 sm:px-14 py-8 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div>
                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Delivery Transit Map</h2>
                 <p className="text-sm text-gray-500 font-medium mt-1">
                     {delivery?.isShell ? 'Shipment currently pending handover.' : lastFetched ? `Data synced ${timeAgo(lastFetched)}` : ''}
                 </p>
             </div>
             
             {/* Micro-status badges */}
             <div className="flex gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
                 {delivery?.vendorName && (
                     <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Fabric</p>
                         <p className="font-bold text-gray-900 text-sm leading-none">{delivery.vendorName}</p>
                     </div>
                 )}
                 {delivery?.tailorName && (
                     <div className="border-l border-gray-100 pl-4">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Tailor</p>
                         <p className="font-bold text-gray-900 text-sm leading-none">{delivery.tailorName}</p>
                     </div>
                 )}
             </div>
          </div>

          <div className="px-8 sm:px-16 py-12 relative z-10">
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
      
    </div>
  );
}
