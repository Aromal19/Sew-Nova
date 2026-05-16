import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';

const DELIVERY_URL = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:3008';

const TAILOR_STEPS = ['In Production', 'Quality Check', 'Out for Delivery', 'Delivered'];

const STEP_ICONS = {
  'In Production':      '🧵',
  'Quality Check':      '🔍',
  'Out for Delivery':   '🚚',
  'Delivered':          '🎉',
};

function getTailorName() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.shopName) return user.shopName;
    if (user.firstname) return `${user.firstname} ${user.lastname || ''}`.trim();
    if (user.email) return user.email.split('@')[0];
    return 'Tailor';
  } catch { return 'Tailor'; }
}

/* ══════════════════════════════════════════════════════════════════ */
export default function TailorDeliveryPanel() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [delivery, setDelivery]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [comment, setComment]         = useState('');
  const [updating, setUpdating]       = useState(false);
  const [toast, setToast]             = useState(null);

  const tailorName = getTailorName();

  const fetchDelivery = async () => {
    try {
      setError(null);
      const res = await axios.get(`${DELIVERY_URL}/api/deliveries/track/${orderId}`);
      if (res.data.success) {
        setDelivery(res.data.delivery);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load delivery info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDelivery(); }, [orderId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirmFabric = async () => {
    setUpdating(true);
    try {
      const res = await axios.patch(`${DELIVERY_URL}/api/deliveries/${orderId}/confirm-fabric-received`, {
        tailorName,
        comment: 'Fabric verified and received by tailor',
      });
      if (res.data.success) {
        showToast(`Fabric confirmed received!`);
        fetchDelivery();
      } else {
        showToast(res.data.message || 'Confirmation failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || 'Confirmation failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await axios.patch(`${DELIVERY_URL}/api/deliveries/${orderId}/tailor-status`, {
        status: newStatus,
        comment,
        updatedBy: tailorName,
        tailorName,
      });
      if (res.data.success) {
        showToast(`Status updated to "${newStatus}"`);
        setComment('');
        fetchDelivery();
      } else {
        showToast(res.data.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Derived state ───────────────────────────────────────────── */
  const vendorStatus  = delivery?.vendorToTailor?.status || 'Pending';
  const tailorStatus  = delivery?.tailorToCustomer?.status || 'Waiting for Fabric';
  const fabricArrived = vendorStatus === 'Delivered to Tailor';
  
  // If tailorStatus is still 'Waiting for Fabric' (or unknown), currentIdx is -1
  const currentIdx    = TAILOR_STEPS.indexOf(tailorStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="tailor" />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="tailor" />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-red-100">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button onClick={fetchDelivery} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors shadow">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="tailor" />

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
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-3 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to orders
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Order <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">#{orderId?.substring(0, 10).toUpperCase()}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage Garment Production & Delivery</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── CARD 1: LEG 1 — Fabric Status (Vendor Leg) ──────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                📦 Fabric Status
              </h2>
            </div>
            
            <div className="p-6">
              {vendorStatus === 'Delivered to Tailor' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-green-800 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-3">✓</div>
                  <h3 className="font-bold text-lg mb-1">Fabric received ✓</h3>
                  <p className="text-sm text-green-700">You can now update the garment status.</p>
                </div>
              ) : vendorStatus === 'In Transit' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mb-3 animate-bounce">🚚</div>
                  <h3 className="font-bold text-lg mb-1 shadow-yellow-100">Fabric is on the way!</h3>
                  <p className="text-sm text-yellow-700 mb-6 max-w-xs">The vendor has dispatched the fabric. Click the button below once you physically receive it.</p>
                  <button
                    onClick={handleConfirmFabric}
                    disabled={updating}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                  >
                    {updating ? 'Confirming...' : 'Confirm Fabric Received'}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-500 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-2xl mb-3">⏳</div>
                  <h3 className="font-bold text-lg mb-1 text-gray-700">Waiting for vendor</h3>
                  <p className="text-sm">Vendor must dispatch the fabric before you can confirm receipt.</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold">
                    Current Vendor Status: <span className="text-gray-900">{vendorStatus}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CARD 2: LEG 2 — Garment Status (EDITABLE) ──────── */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
            fabricArrived ? 'ring-2 ring-purple-100' : 'opacity-60 relative'
          }`}>
            
            {!fabricArrived && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                <div className="bg-white px-5 py-3 rounded-lg shadow-lg border border-gray-100 font-medium text-sm text-gray-600 flex items-center gap-2">
                  🔒 Garment status will unlock once fabric is received
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                👗 Garment Status
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tailorStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {tailorStatus}
              </span>
            </div>

            <div className="p-6">
              {/* Status button grid */}
              <div className="space-y-3 mb-6">
                {TAILOR_STEPS.map((step, i) => {
                  const isPast    = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  const isNext    = i === currentIdx + 1;
                  const isFuture  = i > currentIdx + 1;

                  return (
                    <button
                      key={step}
                      onClick={() => isNext && handleUpdateStatus(step)}
                      disabled={!isNext || updating}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                        isPast    ? 'bg-green-50 text-green-700 border-green-100 cursor-default' :
                        isCurrent ? 'bg-purple-600 text-white border-purple-600 cursor-default shadow-md' :
                        isNext    ? 'bg-white text-purple-700 border-purple-300 hover:border-purple-600 hover:bg-purple-50 hover:shadow-md cursor-pointer group' :
                                    'bg-gray-50 text-gray-400 border-transparent cursor-not-allowed'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isPast    ? 'bg-green-500 text-white shadow-inner' :
                        isCurrent ? 'bg-white/20 text-white' :
                        isNext    ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors' :
                                    'bg-gray-200 text-gray-400'
                      }`}>
                        {isPast ? '✓' : STEP_ICONS[step] || (i + 1)}
                      </span>
                      <span className="flex-1 text-left text-base">{step}</span>
                      {isNext && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 group-hover:text-purple-700 transition-colors">
                          Click to update →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Comment input */}
              {currentIdx >= -1 && currentIdx < TAILOR_STEPS.length - 1 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Update Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add notes for the customer (e.g., Stitching complete, out with courier…)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none shadow-sm"
                  />
                </div>
              )}

              {/* History */}
              {delivery?.tailorToCustomer?.history?.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Update History
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {[...delivery.tailorToCustomer.history]
                      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                      .map((h, i) => (
                        <div key={i} className="flex flex-col gap-1 text-xs bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-800 text-sm">{h.status}</span>
                            <span className="text-gray-400 font-medium">
                              {new Date(h.updatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          {h.comment && <p className="text-gray-600 italic">"{h.comment}"</p>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Track link */}
        <div className="mt-8 text-center">
          <a
            href={`/track/${orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm"
          >
            Preview Customer Tracking Page
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </main>
    </div>
  );
}
