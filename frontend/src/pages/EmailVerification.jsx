import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import API_CONFIG from '../config/api';
import EmailVerificationPending from '../components/EmailVerificationPending';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [status, setStatus] = useState('pending'); // 'pending', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('customer');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
    if (type) setUserType(type);
    if (token && type && !verificationAttempted.current) {
      verificationAttempted.current = true;
      setStatus('loading');
      verifyEmail(token, type);
    }
    // Listen for cross-tab verification
    const handleStorage = (e) => {
      if (e.key === 'sewnova-verified' && e.newValue === 'true') {
        setModalOpen(false);
        if (userType === 'customer') {
          navigate('/customer/landing');
        } else if (userType === 'seller') {
          navigate('/dashboard/seller');
        } else if (userType === 'tailor') {
          navigate('/dashboard/tailor');
        } else {
          navigate('/');
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [searchParams, navigate, userType]);

  const verifyEmail = async (token, type) => {
    try {
      const response = await fetch(
        `${API_CONFIG.AUTH_SERVICE}/api/auth/verify-email?token=${token}&type=${type}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setMessage('Your email has been verified. Redirecting...');
        // Store access token and user info
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('token', data.accessToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Notify all tabs
        localStorage.setItem('sewnova-verified', 'true');
        setTimeout(() => {
          setModalOpen(false);
          if (type === 'customer') {
            navigate('/customer/landing');
          } else if (type === 'seller') {
            navigate('/dashboard/seller');
          } else if (type === 'tailor') {
            navigate('/dashboard/tailor');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'pending') {
    return (
      <EmailVerificationPending
        email={email}
        onBack={() => { setModalOpen(false); navigate('/signup'); }}
        onResend={() => {}}
      />
    );
  }

  return (
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <p className="text-gray-600 text-sm">Verifying your email...</p>
        )}
        {status === 'success' && (
          <p className="text-green-700 text-sm">{message}</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-sm">{message}</p>
        )}
      </div>
    </Modal>
  );
};

export default EmailVerification;