/**
 * Booking Service API
 * Handles communication with the customer service for booking operations
 */

import { apiCall } from '../config/api';

class BookingService {
  /**
   * Get all bookings for the authenticated customer
   * @param {Object} filters - Optional filters (status, bookingType, page, limit)
   * @returns {Promise<Object>} - Bookings data with pagination
   */
  static async getCustomerBookings(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.bookingType) queryParams.append('bookingType', filters.bookingType);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const endpoint = `/api/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiCall('CUSTOMER_SERVICE', endpoint, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }

  /**
   * Get customer orders (enhanced version for orders page)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Orders data
   */
  static async getCustomerOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.bookingType) queryParams.append('bookingType', filters.bookingType);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const endpoint = `/api/bookings/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiCall('CUSTOMER_SERVICE', endpoint, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} - Booking data
   */
  static async getBookingById(bookingId) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}`, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} - Created booking data
   */
  static async createBooking(bookingData) {
    try {
      console.log('Creating booking with data:', bookingData);
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings', {
        method: 'POST',
        body: bookingData
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated booking data
   */
  static async updateBooking(bookingId, updateData) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}`, {
        method: 'PUT',
        body: updateData
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Updated booking data
   */
  static async cancelBooking(bookingId, reason = '') {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        body: { reason }
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated booking data
   */
  static async updateBookingStatus(bookingId, status) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: { status }
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Complete a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} - Updated booking data
   */
  static async completeBooking(bookingId) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/complete`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   * @param {string} bookingId - Booking ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Updated booking data
   */
  static async updatePaymentStatus(bookingId, paymentData) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        body: paymentData
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Add review to booking
   * @param {string} bookingId - Booking ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise<Object>} - Updated booking data
   */
  static async addBookingReview(bookingId, reviewData) {
    try {
      return await apiCall('CUSTOMER_SERVICE', `/api/bookings/${bookingId}/review`, {
        method: 'POST',
        body: reviewData
      });
    } catch (error) {
      console.error('Error adding booking review:', error);
      throw error;
    }
  }

  /**
   * Get recent bookings for debugging
   * @returns {Promise<Object>} - Recent bookings data
   */
  static async getRecentBookings() {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings/debug-recent', { method: 'GET' });
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      throw error;
    }
  }

  /**
   * Create a sample booking for testing
   * @returns {Promise<Object>} - Created sample booking
   */
  static async createSampleBooking() {
    try {
      return await apiCall('CUSTOMER_SERVICE', '/api/bookings/debug/sample', { method: 'POST' });
    } catch (error) {
      console.error('Error creating sample booking:', error);
      throw error;
    }
  }
}

export default BookingService;
