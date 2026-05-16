import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingCacheService from '../utils/bookingCache';

const ResumeBookingNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [bookingCache] = useState(new BookingCacheService());
  const navigate = useNavigate();

  useEffect(() => {
    checkForPendingBooking();
  }, []);

  const checkForPendingBooking = () => {
    const summary = bookingCache.getBookingSummary();
    if (summary && summary.progressPercentage > 0) {
      setBookingSummary(summary);
      setShowNotification(true);
    }
  };

  const handleResumeBooking = () => {
    navigate('/customer/booking/create', { 
      state: { resume: true } 
    });
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const handleClearBooking = () => {
    bookingCache.clearBookingProgress();
    setShowNotification(false);
    setBookingSummary(null);
  };

  if (!showNotification || !bookingSummary) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Continue Your Order
              </h4>
              <p className="text-xs text-gray-600">
                You have a pending custom order
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{bookingSummary.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${bookingSummary.progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-3">
          <div className="flex justify-between">
            <span>Step {bookingSummary.currentStep} of {bookingSummary.totalSteps}</span>
            <span>₹{bookingSummary.totalCost}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleResumeBooking}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={handleClearBooking}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBookingNotification;
