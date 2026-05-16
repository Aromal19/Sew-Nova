import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/api';

const AdminProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        // Use unified authentication system
        const isAuthenticated = isAdminAuthenticated();
        
        if (isAuthenticated) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to main login if not authenticated
  if (!isValid) {
    console.log('Admin not authenticated, redirecting to main login...');
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
};

export default AdminProtectedRoute;
