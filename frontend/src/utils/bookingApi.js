// API utilities for booking and customer flow
import { apiCall } from '../config/api';

// Customer Service API calls
export const customerAPI = {
  // Get customer bookings
  getBookings: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get customer orders (enhanced version from bookings)
  getOrders: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings/orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings', {
        method: 'POST',
        body: bookingData
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update a booking
  updateBooking: async (bookingId, updateData) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}`, {
        method: 'PUT',
        body: updateData
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Get customer measurements
  getMeasurements: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/measurements');
    } catch (error) {
      console.error('Error fetching measurements:', error);
      throw error;
    }
  },

  // Create measurement
  createMeasurement: async (measurementData) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/measurements', {
        method: 'POST',
        body: measurementData
      });
    } catch (error) {
      console.error('Error creating measurement:', error);
      throw error;
    }
  },

  // Get customer addresses
  getAddresses: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/addresses');
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Create address
  createAddress: async (addressData) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/addresses', {
        method: 'POST',
        body: addressData
      });
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }
};

// Delivery Service API calls
export const deliveryAPI = {
  // Get tracking information for a booking
  getTracking: async (bookingId) => {
    try {
      const deliveryServiceUrl = import.meta.env.VITE_DELIVERY_SERVICE_URL;

      if (!deliveryServiceUrl) {
        throw new Error('Delivery Service URL is not configured');
      }

      // We need to use a custom fetch implementation here because apiCall currently relies 
      // on pre-configured base URLs keyed by service name in ../config/api.js, 
      // but we haven't checked if DELIVERY_SERVICE is configured there.
      // To be safe and consistent with the plan, we'll use a direct fetch approach 
      // or if we could extend apiCall, we would.
      // Assuming we need to stay within the pattern but maybe the service key isn't there yet.
      // Let's check if we can just pass the URL directly or if we need to use the token.

      // Since apiCall might throw "Service URL not configured" if we use a new key 'DELIVERY_SERVICE'
      // without updating the config, let's try to be robust. 
      // However, for this implementation, let's assume we can use the direct URL with the token.

      const token = localStorage.getItem('token');
      const response = await fetch(`${deliveryServiceUrl}/api/deliveries/tracking/${bookingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, notFound: true, message: 'Tracking information not found' };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delivery service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tracking:', error);
      throw error;
    }
  }
};

// Vendor Service API calls
export const vendorAPI = {
  // Get all products/fabrics
  getProducts: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/products?${queryString}` : '/api/products';
      return await apiCall('SELLER_SERVICE', url);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (productId) => {
    try {
      return await apiCall('SELLER_SERVICE', `/api/products/${productId}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get products by seller
  getSellerProducts: async (sellerId) => {
    try {
      return await apiCall('SELLER_SERVICE', `/api/sellers/${sellerId}/products`);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchQuery, filters = {}) => {
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const queryString = new URLSearchParams(params).toString();
      return await apiCall('SELLER_SERVICE', `/api/products/search?${queryString}`);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

// Tailor Service API calls
export const tailorAPI = {
  // Get all tailors
  getTailors: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/tailors?${queryString}` : '/api/tailors';
      return await apiCall('TAILOR_SERVICE', url);
    } catch (error) {
      console.error('Error fetching tailors:', error);
      throw error;
    }
  },

  // Get single tailor
  getTailor: async (tailorId) => {
    try {
      return await apiCall('TAILOR_SERVICE', `/api/tailors/${tailorId}`);
    } catch (error) {
      console.error('Error fetching tailor:', error);
      throw error;
    }
  },

  // Get tailor services
  getTailorServices: async (tailorId) => {
    try {
      return await apiCall('TAILOR_SERVICE', `/api/tailors/${tailorId}/services`);
    } catch (error) {
      console.error('Error fetching tailor services:', error);
      throw error;
    }
  },

  // Get tailor availability
  getTailorAvailability: async (tailorId, date) => {
    try {
      const params = date ? { date } : {};
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/tailors/${tailorId}/availability?${queryString}` : `/api/tailors/${tailorId}/availability`;
      return await apiCall('TAILOR_SERVICE', url);
    } catch (error) {
      console.error('Error fetching tailor availability:', error);
      throw error;
    }
  },

  // Search tailors
  searchTailors: async (searchQuery, filters = {}) => {
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const queryString = new URLSearchParams(params).toString();
      return await apiCall('TAILOR_SERVICE', `/api/tailors/search?${queryString}`);
    } catch (error) {
      console.error('Error searching tailors:', error);
      throw error;
    }
  },

  // Get tailor orders
  getTailorOrders: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/tailor/orders');
    } catch (error) {
      console.error('Error fetching tailor orders:', error);
      throw error;
    }
  },

  // Get active orders for tailor
  getActiveOrders: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/tailor/orders/active');
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/tailor/orders/${orderId}`);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/tailor/orders/${orderId}/status`, {
        method: 'PUT',
        body: { status }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Add message to order
  addOrderMessage: async (orderId, message) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/tailor/orders/${orderId}/messages`, {
        method: 'POST',
        body: { message }
      });
    } catch (error) {
      console.error('Error adding order message:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStatistics: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/tailor/orders/statistics');
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }
};

// Wishlist API calls
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/wishlist');
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (itemId, itemType) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/wishlist', {
        method: 'POST',
        body: { itemId, itemType }
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (itemId, itemType) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/wishlist', {
        method: 'DELETE',
        body: { itemId, itemType }
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
};

// Reviews API calls
export const reviewAPI = {
  // Get reviews for a tailor
  getTailorReviews: async (tailorId) => {
    try {
      return await apiCall('TAILOR_SERVICE', `/api/tailors/${tailorId}/reviews`);
    } catch (error) {
      console.error('Error fetching tailor reviews:', error);
      throw error;
    }
  },

  // Get reviews for a product
  getProductReviews: async (productId) => {
    try {
      return await apiCall('SELLER_SERVICE', `/api/products/${productId}/reviews`);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Add review
  addReview: async (reviewData) => {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/reviews', {
        method: 'POST',
        body: reviewData
      });
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
};

// Utility functions
export const formatPrice = (price, currency = '₹') => {
  if (typeof price !== 'number') return 'Price not available';
  return `${currency}${price.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return 'Date not available';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'Date not available';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+91[\-\s]?)?[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BK${timestamp}${random}`.toUpperCase();
};

export const getBookingStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    ready_for_delivery: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-700';
};

export const getPaymentStatusColor = (status) => {
  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-700';
};