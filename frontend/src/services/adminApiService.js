// Admin API Service for direct admin service communication
import API_CONFIG from '../config/api';
const ADMIN_SERVICE_URL = API_CONFIG.ADMIN_SERVICE;

// Helper function to get admin auth headers (using main authentication)
const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to check if user is authenticated (using main authentication)
const isAuthenticated = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return !!token;
};

// Helper function to make admin API calls
export const adminApiCall = async (endpoint, options = {}) => {
  try {
    const url = `${ADMIN_SERVICE_URL}${endpoint}`;
    
    // Get token and log for debugging
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    console.log('🔍 Admin API Call Debug:');
    console.log('URL:', url);
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options,
    };

    console.log('Request headers:', defaultOptions.headers);

    const response = await fetch(url, defaultOptions);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Admin API call error:', error);
    throw error;
  }
};

// Admin Service API calls
export const adminApiService = {
  // Design Management
  async getDesigns(params = {}) {
    const { page = 1, limit = 10, category, search, isActive = true } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isActive: isActive.toString(),
      ...(category && { category }),
      ...(search && { search })
    });

    return await adminApiCall(`/api/designs?${queryParams}`);
  },

  async getDesignById(designId) {
    return await adminApiCall(`/api/designs/${designId}`);
  },

  async createDesign(designData) {
    // Check if it's FormData (for file uploads)
    if (designData instanceof FormData) {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData, let browser set it
      
      // Make direct fetch call to avoid getAdminAuthHeaders() interference
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/designs`, {
        method: 'POST',
        body: designData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } else {
      return await adminApiCall('/api/designs', {
        method: 'POST',
        body: JSON.stringify(designData)
      });
    }
  },

  async updateDesign(designId, designData) {
    // Check if it's FormData (for file uploads)
    if (designData instanceof FormData) {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/designs/${designId}`, {
        method: 'PUT',
        body: designData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } else {
      return await adminApiCall(`/api/designs/${designId}`, {
        method: 'PUT',
        body: JSON.stringify(designData)
      });
    }
  },

  async deleteDesign(designId) {
    return await adminApiCall(`/api/designs/${designId}`, {
      method: 'DELETE'
    });
  },

  async getDesignStats() {
    return await adminApiCall('/api/designs/stats');
  },

  async getDesignCategories() {
    return await adminApiCall('/api/designs/categories');
  },

  async getMeasurements() {
    return await adminApiCall('/api/measurements');
  },

  // User Management
  async getAllUsers(params = {}) {
    const { page = 1, limit = 10, role, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
      ...(search && { search })
    });

    return await adminApiCall(`/api/users?${queryParams}`);
  },

  async getUserById(userId) {
    return await adminApiCall(`/api/users/${userId}`);
  },

  async updateUserStatus(userId, status) {
    return await adminApiCall(`/api/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async deleteUser(userId) {
    return await adminApiCall(`/api/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Analytics
  async getAnalytics(period = '30d') {
    return await adminApiCall(`/api/analytics?period=${period}`);
  },

  async getRevenueAnalytics(period = '30d') {
    return await adminApiCall(`/api/analytics/revenue?period=${period}`);
  },

  async getUserAnalytics(period = '30d') {
    return await adminApiCall(`/api/analytics/users?period=${period}`);
  },

  // Admin Profile
  async getAdminProfile() {
    return await adminApiCall('/api/admin/profile');
  },

  async updateAdminProfile(profileData) {
    // Check if it's FormData (for file uploads)
    if (profileData instanceof FormData) {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData, let browser set it
      
      // Make direct fetch call to avoid getAdminAuthHeaders() interference
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/profile`, {
        method: 'PUT',
        body: profileData,
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } else {
      return await adminApiCall('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  },

  async changePassword(passwordData) {
    return await adminApiCall('/api/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  },

  async getDashboardStats() {
    return await adminApiCall('/api/admin/dashboard-stats');
  },

  // Booking Management (using new booking endpoints - no auth required)
  async getAllOrders(params = {}) {
    const { page = 1, limit = 10, status, customerId, bookingType, sortBy = 'createdAt', sortOrder = 'desc', search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(bookingType && { bookingType }),
      ...(search && { search })
    });

    console.log('🔍 Admin API getAllOrders called with params:', params);
    console.log('🌐 Query string:', queryParams.toString());
    
    const result = await adminApiCall(`/api/bookings?${queryParams}`);
    console.log('📊 Admin API getAllOrders result:', result);
    
    return result;
  },

  async getOrderById(orderId) {
    return await adminApiCall(`/api/bookings/${orderId}`);
  },

  async updateOrderStatus(orderId, statusData) {
    return await adminApiCall(`/api/bookings/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  },

  async getOrderStatistics() {
    return await adminApiCall('/api/bookings/statistics');
  }
};

export default adminApiService;
