import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, validateToken } from '../utils/api';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check for regular user authentication (including admin)
        const authenticated = isAuthenticated();
        
        if (!authenticated) {
          setIsValid(false);
          setIsLoading(false);
          return;
        }

        // Validate token with backend
        const validationResult = await validateToken();
        
        if (validationResult.success) {
          setIsValid(true);
          // Get user role from localStorage or validation result
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setUserRole(user.role || localStorage.getItem('userRole'));
        } else {
          // Token is invalid, clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          setIsValid(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coralblush mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and doesn't match, redirect to appropriate dashboard
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to user's appropriate dashboard based on their role
    switch (userRole) {
      case 'customer':
        return <Navigate to="/customer/landing" replace />;
      case 'seller':
        return <Navigate to="/dashboard/seller" replace />;
      case 'tailor':
        return <Navigate to="/dashboard/tailor" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If authenticated and role matches (if required), render children
  return children;
};

export default ProtectedRoute;