// API Configuration for SewNova Services
// In production, all services are behind a single API gateway on Render.
// The gateway routes by service-key prefix: /<service>/api/...
//
// In development, you can still point to individual localhost ports via .env:
// VITE_AUTH_SERVICE_URL=http://localhost:3001
// VITE_CUSTOMER_SERVICE_URL=http://localhost:3002
// etc.

// Production gateway base URL (set in Vercel env vars)
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://sewnova-backend.onrender.com';

const API_CONFIG = {
  // Auth Service — gateway route: /auth/api/*
  AUTH_SERVICE: import.meta.env.VITE_AUTH_SERVICE_URL || `${GATEWAY_URL}/auth`,

  // Customer Service — gateway route: /customer/api/*
  CUSTOMER_SERVICE: import.meta.env.VITE_CUSTOMER_SERVICE_URL || `${GATEWAY_URL}/customer`,

  // Admin Service — gateway route: /admin/api/*
  ADMIN_SERVICE: import.meta.env.VITE_ADMIN_SERVICE_URL || `${GATEWAY_URL}/admin`,

  // Design Service — gateway route: /design/api/*
  DESIGN_SERVICE: import.meta.env.VITE_DESIGN_SERVICE_URL || `${GATEWAY_URL}/design`,

  // Tailor Service — gateway route: /tailor/api/*
  TAILOR_SERVICE: import.meta.env.VITE_TAILOR_SERVICE_URL || `${GATEWAY_URL}/tailor`,

  // Seller / Vendor Service — gateway route: /vendor/api/*
  SELLER_SERVICE: import.meta.env.VITE_SELLER_SERVICE_URL || `${GATEWAY_URL}/vendor`,

  // Payment Service — gateway route: /payment/api/*
  PAYMENT_SERVICE: import.meta.env.VITE_PAYMENT_SERVICE_URL || `${GATEWAY_URL}/payment`,

  // Delivery Service — gateway route: /delivery/api/*
  DELIVERY_SERVICE: import.meta.env.VITE_DELIVERY_SERVICE_URL || `${GATEWAY_URL}/delivery`,

  // AI Measurement Service — standalone (kept for local dev only)
  MEASUREMENT_SERVICE: import.meta.env.VITE_MEASUREMENT_SERVICE_URL || 'http://localhost:8001',
};

// Helper function to get full API URL
export const getApiUrl = (service, endpoint) => {
  const baseUrl = API_CONFIG[service];
  if (!baseUrl) {
    throw new Error(`Unknown service: ${service}`);
  }
  return `${baseUrl}${endpoint}`;
};

// Helper function to make authenticated API calls
export const apiCall = async (service, endpoint, options = {}) => {
  try {
    const url = getApiUrl(service, endpoint);
    let token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    // Decode JWT to check expiry
    const isTokenNearExpiry = (jwtToken) => {
      try {
        if (!jwtToken) return true;
        const parts = jwtToken.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        const safetyWindowSeconds = 30; // refresh if expiring within 30s
        return typeof payload.exp !== 'number' || payload.exp <= (now + safetyWindowSeconds);
      } catch {
        return true;
      }
    };

    // Proactively refresh if no token or token near expiry
    if (!token || isTokenNearExpiry(token)) {
      try {
        const preRefreshResponse = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include'
        });
        const preRefreshData = await preRefreshResponse.json();
        if (preRefreshData?.success && preRefreshData?.accessToken) {
          localStorage.setItem('accessToken', preRefreshData.accessToken);
          localStorage.setItem('token', preRefreshData.accessToken);
          token = preRefreshData.accessToken;
        }
      } catch {}
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const fetchInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
      credentials: 'include',
    };

    if (fetchInit.body && typeof fetchInit.body !== 'string') {
      fetchInit.body = JSON.stringify(fetchInit.body);
    }

    let response = await fetch(url, fetchInit);

    // If unauthorized, try to refresh access token once and retry
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include'
        });
        const refreshData = await refreshResponse.json();
        if (refreshData?.success && refreshData?.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('token', refreshData.accessToken);
          // Retry original request with new token
          const retriedHeaders = {
            ...defaultOptions.headers,
            ...(refreshData.accessToken && { 'Authorization': `Bearer ${refreshData.accessToken}` }),
            ...options.headers,
          };
          response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: retriedHeaders,
            credentials: 'include',
          });
        }
      } catch {}
    }

    if (!response.ok) {
      let msg;
      try {
        const errJson = await response.json();
        msg = errJson?.message || errJson?.error || `${response.status} ${response.statusText}`;
      } catch {
        msg = `${response.status} ${response.statusText}`;
      }
      throw new Error(`API call failed: ${msg}`);
    }

    return response.json();
  } catch (error) {
    console.error('apiCall error:', error);
    throw error;
  }
};

export default API_CONFIG;