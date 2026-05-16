import API_CONFIG from '../config/api.js';

const API_BASE_URL = `${API_CONFIG.AUTH_SERVICE}/api`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle token invalidation
const handleTokenInvalidation = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
};

// Refresh access token using refresh token (cookie)
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } else {
      handleTokenInvalidation();
      return null;
    }
  } catch (error) {
    handleTokenInvalidation();
    return null;
  }
};

// Enhanced fetch wrapper that handles token refresh
export const authenticatedFetch = async (url, options = {}) => {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    },
    credentials: 'include',
  });
  if (response.status === 401) {
    // Try to refresh token
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        },
        credentials: 'include',
      });
    } else {
      return { success: false, message: 'Session expired. Please log in again.' };
    }
  }
  try {
    return await response.json();
  } catch {
    return { success: false, message: 'Network error' };
  }
};

// API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
      credentials: 'include',
    });
    const data = await response.json();
    console.log('Auth API response:', data);
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('token', data.accessToken); // Also store as 'token' for compatibility
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  // Get user role by email
  getUserRole: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/get-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase() }),
    });
    return response.json();
  },
  // Validate token
  validateToken: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.status === 401) {
        handleTokenInvalidation();
        return { success: false, message: 'Token invalidated' };
      }
      return data;
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
};

// DEBUG: Function to manually set token for testing
export const setTokenManually = async () => {
  try {
    console.log('🔧 Manually setting token...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aromalgirish00@gmail.com',
        password: 'Aromal@2002'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('token', data.accessToken);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Token set successfully!');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting token:', error);
    return false;
  }
};

// DEBUG: Function to check current token status
export const checkTokenStatus = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Token Status Check:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = payload.exp - now;
        
        console.log('Token payload:', payload);
        console.log('Token expires in:', expiresIn, 'seconds');
        console.log('Token valid:', expiresIn > 0);
        
        return {
          exists: true,
          valid: expiresIn > 0,
          expiresIn,
          payload
        };
      }
    } catch (error) {
      console.log('❌ Error decoding token:', error);
    }
  }
  
  return { exists: false, valid: false };
};

export const logout = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authenticated and has admin role
  if (!token || !user || userRole !== 'admin') {
    return false;
  }
  
  // Parse user data to verify admin role
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin' || userRole === 'admin';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'customer': return '/customer/landing';
    case 'tailor': return '/dashboard/tailor';
    case 'seller': return '/dashboard/seller';
    case 'admin': return '/admin/dashboard';
    default: return '/';
  }
};

// Export validateToken function directly for use in ProtectedRoute
export const validateToken = authAPI.validateToken; 