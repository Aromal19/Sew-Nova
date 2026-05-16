import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const STATUSES = ['Pending', 'Confirmed', 'In Production', 'In Transit', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', btn: 'bg-yellow-500 hover:bg-yellow-600' },
  'Confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', btn: 'bg-blue-500 hover:bg-blue-600' },
  'In Production': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', btn: 'bg-indigo-500 hover:bg-indigo-600' },
  'In Transit': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', btn: 'bg-orange-500 hover:bg-orange-600' },
  'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', btn: 'bg-purple-500 hover:bg-purple-600' },
  'Delivered': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', btn: 'bg-green-500 hover:bg-green-600' },
};

const DeliveryStatusPanel = ({ orderId: propOrderId }) => {
  const params = useParams();
  const orderId = propOrderId || params.orderId;

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const url = `${API_CONFIG.DELIVERY_SERVICE}/api/deliveries/track/${orderId}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setDelivery(res.data.delivery);
        setSelectedStatus(null);
        setComment('');
      }
    } catch (err) {
      console.error('Error fetching delivery:', err);
      showToast('Failed to load delivery data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchTracking();
  }, [orderId]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      showToast('Please select a status first', 'error');
      return;
    }

    try {
      setUpdating(true);

      // Get user info for updatedBy field
      let updatedBy = 'Tailor/Vendor';
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        updatedBy = userData.email || userData.name || `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'Tailor/Vendor';
      } catch { /* use default */ }

      const url = `${API_CONFIG.DELIVERY_SERVICE}/api/deliveries/${orderId}/status`;
      const res = await axios.patch(url, {
        status: selectedStatus,
        comment: comment.trim(),
        updatedBy,
      });

      if (res.data.success) {
        showToast(`Status updated to "${selectedStatus}" successfully!`, 'success');
        await fetchTracking();
      } else {
        showToast(res.data.message || 'Update failed', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status. Please try again.';
      showToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const currentIdx = delivery ? STATUSES.indexOf(delivery.status) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-600 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading delivery status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right max-w-sm ${
          toast.type === 'success'
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
        }`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="font-medium text-sm">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold">🔧 Delivery Status Panel</h1>
          <p className="text-gray-300 text-sm mt-1 font-mono">
            Order: #{orderId?.substring(0, 10).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Current Status Badge */}
        {delivery && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Status</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                    STATUS_COLORS[delivery.status]?.bg || 'bg-gray-100'
                  } ${STATUS_COLORS[delivery.status]?.text || 'text-gray-800'} ${
                    STATUS_COLORS[delivery.status]?.border || ''
                  } border`}>
                    {delivery.status}
                  </span>
                </div>
              </div>
              <button
                onClick={fetchTracking}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all"
              >
                🔄 Refresh
              </button>
            </div>

            {delivery.currentComment && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Current Comment</p>
                <p className="text-gray-200 text-sm">{delivery.currentComment}</p>
              </div>
            )}
          </div>
        )}

        {/* Status Selection Grid */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Select New Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STATUSES.map((status, idx) => {
              const isPassed = idx <= currentIdx;
              const isSelected = selectedStatus === status;
              const isClickable = idx > currentIdx;
              const colors = STATUS_COLORS[status];

              return (
                <button
                  key={status}
                  onClick={() => isClickable && setSelectedStatus(status)}
                  disabled={isPassed}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isPassed
                      ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg scale-[1.02]`
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  {isPassed && (
                    <span className="absolute top-2 right-2 text-green-400 text-sm">✓</span>
                  )}
                  <p className={`font-bold text-sm ${isPassed ? 'text-gray-500' : isSelected ? colors.text : 'text-white'}`}>
                    {status}
                  </p>
                  <p className={`text-xs mt-1 ${isPassed ? 'text-gray-600' : isSelected ? colors.text : 'text-gray-400'}`}>
                    Step {idx + 1} of {STATUSES.length}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment + Update */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Add Comment (Optional)</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add a note about this status update..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
          />

          <div className="mt-4 flex items-center justify-between">
            <div>
              {selectedStatus && (
                <p className="text-sm text-gray-300">
                  Moving to: <span className={`font-bold ${STATUS_COLORS[selectedStatus]?.text || 'text-white'} ${STATUS_COLORS[selectedStatus]?.bg || ''} px-2 py-0.5 rounded`}>{selectedStatus}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={!selectedStatus || updating}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
                !selectedStatus || updating
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : `${STATUS_COLORS[selectedStatus]?.btn || 'bg-purple-600 hover:bg-purple-700'} hover:shadow-xl hover:scale-[1.02]`
              }`}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Updating...
                </span>
              ) : (
                '🚀 Update Status'
              )}
            </button>
          </div>
        </div>

        {/* Status History */}
        {delivery?.statusHistory?.length > 0 && (
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">📜 Status History</h2>
            <div className="space-y-3">
              {delivery.statusHistory
                .slice()
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      STATUS_COLORS[entry.status]?.bg || 'bg-gray-100'
                    } ${STATUS_COLORS[entry.status]?.text || 'text-gray-800'}`}>
                      {entry.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      {entry.comment && (
                        <p className="text-gray-300 text-sm">{entry.comment}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        by {entry.updatedBy} • {new Date(entry.updatedAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DeliveryStatusPanel;
