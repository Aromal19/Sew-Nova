import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const STATUSES = ['Pending', 'Confirmed', 'In Production', 'In Transit', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Pending': '📋',
  'Confirmed': '✅',
  'In Production': '🔨',
  'In Transit': '🚚',
  'Out for Delivery': '📦',
  'Delivered': '🎉',
};

const STATUS_DESCRIPTIONS = {
  'Pending': 'Your order has been placed and is awaiting confirmation.',
  'Confirmed': 'Your order has been confirmed by the tailor.',
  'In Production': 'Your garment is being crafted with care.',
  'In Transit': 'Your order has been shipped and is on its way.',
  'Out for Delivery': 'Your order is out for delivery today!',
  'Delivered': 'Your order has been successfully delivered.',
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const url = `${API_CONFIG.DELIVERY_SERVICE}/api/deliveries/track/${orderId}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setDelivery(res.data.delivery);
      } else {
        setError('Could not load tracking information.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError('Unable to reach delivery service. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchTracking();
  }, [orderId]);

  const currentIdx = delivery ? STATUSES.indexOf(delivery.status) : -1;

  // Find the timestamp for a given status from history
  const getTimestampForStatus = (status) => {
    if (!delivery?.statusHistory) return null;
    const entry = delivery.statusHistory.find(h => h.status === status);
    return entry?.updatedAt || null;
  };

  // Find comment for a given status from history
  const getCommentForStatus = (status) => {
    if (!delivery?.statusHistory) return null;
    const entry = delivery.statusHistory.find(h => h.status === status);
    return entry?.comment || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link to="/" className="text-purple-200 hover:text-white text-sm mb-2 inline-block transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">📦 Order Tracking</h1>
          <p className="text-purple-200 mt-1 font-mono text-sm">
            Order ID: #{orderId?.substring(0, 10).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 shadow-sm">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Status Badge Card */}
        {delivery && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                  {STATUS_ICONS[delivery.status] || '📋'}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Current Status</p>
                  <p className="text-2xl font-bold text-gray-900">{delivery.status}</p>
                </div>
              </div>
              <button
                onClick={fetchTracking}
                disabled={refreshing}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                <span className={`inline-block ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Current comment */}
            {delivery.currentComment && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-sm font-semibold text-purple-700 mb-1">💬 Latest Update</p>
                <p className="text-gray-700">{delivery.currentComment}</p>
              </div>
            )}
          </div>
        )}

        {/* Vertical Stepper Timeline */}
        {delivery && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Delivery Timeline</h2>

            <div className="relative">
              {STATUSES.map((status, idx) => {
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;
                const isFuture = idx > currentIdx;
                const timestamp = getTimestampForStatus(status);
                const comment = getCommentForStatus(status);
                const isLast = idx === STATUSES.length - 1;

                return (
                  <div key={status} className="relative flex gap-6 pb-10 last:pb-0">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div className="absolute left-[22px] top-[44px] w-0.5 h-[calc(100%-24px)]">
                        <div
                          className={`w-full h-full transition-all duration-700 ${
                            isCompleted ? 'bg-gradient-to-b from-green-400 to-green-500' :
                            isActive ? 'bg-gradient-to-b from-purple-400 to-gray-200' :
                            'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}

                    {/* Circle icon */}
                    <div className="flex-shrink-0 relative z-10">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-all duration-500 shadow-md ${
                          isCompleted
                            ? 'bg-green-500 border-green-400 text-white shadow-green-200'
                            : isActive
                            ? 'bg-purple-600 border-purple-400 text-white shadow-purple-200 ring-4 ring-purple-100 animate-pulse'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : STATUS_ICONS[status]}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-base font-bold ${
                            isActive ? 'text-purple-700' :
                            isCompleted ? 'text-green-700' :
                            'text-gray-400'
                          }`}>
                            {status}
                          </h3>
                          <p className={`text-sm mt-0.5 ${
                            isActive ? 'text-gray-600' :
                            isCompleted ? 'text-gray-500' :
                            'text-gray-300'
                          }`}>
                            {STATUS_DESCRIPTIONS[status]}
                          </p>
                        </div>
                      </div>

                      {/* Timestamp */}
                      {timestamp && (isCompleted || isActive) && (
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                          🕓 {new Date(timestamp).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}

                      {/* Comment for this step */}
                      {comment && (isCompleted || isActive) && (
                        <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                          isActive ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                          💬 {comment}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
