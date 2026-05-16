import React, { useState, useEffect, useRef } from 'react';
import API_CONFIG from '../config/api';
import Modal from './Modal';

const EmailVerificationPending = ({ email, onBack, onResend }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [timer, setTimer] = useState(60);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimer(60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setResendStatus('success');
        setTimer(60);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        if (onResend) onResend();
      } else {
        setResendStatus('error');
      }
    } catch (error) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={() => {}}>
      <div className="max-w-xs w-full text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Verification Link Sent</h2>
        <p className="text-gray-600 text-sm">
          A verification link has been sent to your email{email ? `: ${email}` : ''}.
        </p>
        <p className="text-xs text-blue-700">Once you verify your email, please refresh this page.</p>
        {resendStatus === 'success' && (
          <p className="text-green-700 text-xs">Verification email sent successfully!</p>
        )}
        {resendStatus === 'error' && (
          <p className="text-red-700 text-xs">Failed to resend verification email. Please try again.</p>
        )}
        <button
          onClick={handleResend}
          disabled={isResending || timer > 0}
          className={`w-full bg-slate-600 text-white py-2 px-4 rounded-lg font-medium text-xs transition-colors duration-200 ${isResending || timer > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
        >
          {timer > 0 ? `Resend in ${timer}s` : 'Resend Verification Email'}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-xs hover:bg-gray-200 transition-colors duration-200"
          >
            Back to Sign Up
          </button>
        )}
      </div>
    </Modal>
  );
};

export default EmailVerificationPending;