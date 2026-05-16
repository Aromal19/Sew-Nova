import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleOAuthTest = () => {
  const [status, setStatus] = useState('Ready to test');
  const [error, setError] = useState(null);

  const handleSuccess = (credentialResponse) => {
    setStatus('✅ Google Sign-In successful!');
    setError(null);
    console.log('Google Sign-In Success:', credentialResponse);
  };

  const handleError = (error) => {
    setStatus('❌ Google Sign-In failed');
    setError(error);
    console.error('Google Sign-In Error:', error);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Google OAuth Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status: {status}</p>
        {error && (
          <div className="text-red-600 text-sm">
            Error: {error.toString()}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          logo_alignment="left"
          auto_select={false}
          cancel_on_tap_outside={false}
        />
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>This is a test component to verify Google OAuth configuration.</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default GoogleOAuthTest;
