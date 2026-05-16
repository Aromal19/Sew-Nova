// Booking Flow Cache Service
// Handles saving and restoring booking flow progress

class BookingCacheService {
  constructor() {
    this.cacheKey = 'sewnova_booking_flow';
    this.cartKey = 'sewnova_cart';
  }

  // Save booking progress to cache
  saveBookingProgress(bookingData) {
    try {
      const cacheData = {
        ...bookingData,
        savedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      
      // Also add to cart as pending booking
      this.addToCart(bookingData);
      
      return true;
    } catch (error) {
      console.error('Error saving booking progress:', error);
      return false;
    }
  }

  // Get saved booking progress
  getBookingProgress() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      
      // Check if cache is not too old (7 days)
      const savedAt = new Date(data.savedAt);
      const now = new Date();
      const daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        this.clearBookingProgress();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting booking progress:', error);
      return null;
    }
  }

  // Clear booking progress
  clearBookingProgress() {
    try {
      localStorage.removeItem(this.cacheKey);
      this.removeFromCart();
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('bookingCacheCleared'));
      return true;
    } catch (error) {
      console.error('Error clearing booking progress:', error);
      return false;
    }
  }

  // Add booking to cart as pending item
  addToCart(bookingData) {
    try {
      const cart = this.getCart();
      
      // Remove existing booking if any
      const filteredCart = cart.filter(item => item.type !== 'booking');
      
      // Add new booking item
      const bookingItem = {
        id: 'pending_booking',
        type: 'booking',
        name: this.getBookingTitle(bookingData),
        description: this.getBookingDescription(bookingData),
        price: this.calculateBookingPrice(bookingData),
        image: this.getBookingImage(bookingData),
        status: 'pending',
        bookingData: bookingData,
        addedAt: new Date().toISOString()
      };
      
      filteredCart.push(bookingItem);
      localStorage.setItem(this.cartKey, JSON.stringify(filteredCart));
      
      return true;
    } catch (error) {
      console.error('Error adding booking to cart:', error);
      return false;
    }
  }

  // Remove booking from cart
  removeFromCart() {
    try {
      const cart = this.getCart();
      const filteredCart = cart.filter(item => item.type !== 'booking');
      localStorage.setItem(this.cartKey, JSON.stringify(filteredCart));
      return true;
    } catch (error) {
      console.error('Error removing booking from cart:', error);
      return false;
    }
  }

  // Get cart items
  getCart() {
    try {
      const cart = localStorage.getItem(this.cartKey);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Get booking title for cart display
  getBookingTitle(bookingData) {
    if (bookingData.selectedDesign) {
      return `${bookingData.selectedDesign.name} - Custom Tailoring`;
    }
    if (bookingData.selectedFabric) {
      return `${bookingData.selectedFabric.name} - Custom Order`;
    }
    return 'Custom Tailoring Order';
  }

  // Get booking description for cart display
  getBookingDescription(bookingData) {
    const parts = [];
    
    if (bookingData.selectedFabric) {
      parts.push(`Fabric: ${bookingData.selectedFabric.name}`);
    }
    
    if (bookingData.selectedDesign) {
      parts.push(`Design: ${bookingData.selectedDesign.name}`);
    }
    
    if (bookingData.selectedTailor) {
      parts.push(`Tailor: ${bookingData.selectedTailor.shopName}`);
    }
    
    if (bookingData.serviceType) {
      parts.push(`Service: ${bookingData.serviceType === 'fabric-only' ? 'Fabric Only' : 'Fabric + Tailoring'}`);
    }
    
    return parts.join(' • ');
  }

  // Calculate booking price
  calculateBookingPrice(bookingData) {
    let total = 0;
    
    if (bookingData.fabricCost) {
      total += bookingData.fabricCost;
    }
    
    if (bookingData.tailoringCost) {
      total += bookingData.tailoringCost;
    }
    
    return total || 0;
  }

  // Get booking image
  getBookingImage(bookingData) {
    if (bookingData.selectedDesign?.image) {
      return bookingData.selectedDesign.image;
    }
    if (bookingData.selectedDesign?.images?.[0]) {
      return bookingData.selectedDesign.images[0].url || bookingData.selectedDesign.images[0];
    }
    if (bookingData.selectedFabric?.images?.[0]) {
      return bookingData.selectedFabric.images[0];
    }
    return '/images/default-booking.jpg';
  }

  // Check if user has pending booking
  hasPendingBooking() {
    const cart = this.getCart();
    return cart.some(item => item.type === 'booking' && item.status === 'pending');
  }

  // Get pending booking item
  getPendingBooking() {
    const cart = this.getCart();
    return cart.find(item => item.type === 'booking' && item.status === 'pending');
  }

  // Update booking progress
  updateBookingProgress(updates) {
    try {
      const current = this.getBookingProgress();
      if (!current) return false;
      
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return this.saveBookingProgress(updated);
    } catch (error) {
      console.error('Error updating booking progress:', error);
      return false;
    }
  }

  // Get booking progress summary
  getBookingSummary() {
    const progress = this.getBookingProgress();
    if (!progress) return null;
    
    return {
      currentStep: progress.currentStep || 1,
      totalSteps: this.getTotalSteps(progress),
      completedSteps: this.getCompletedSteps(progress),
      progressPercentage: this.getProgressPercentage(progress),
      hasFabric: !!progress.selectedFabric,
      hasDesign: !!progress.selectedDesign,
      hasTailor: !!progress.selectedTailor,
      hasMeasurements: !!progress.measurementId || Object.keys(progress.customMeasurements || {}).length > 0,
      serviceType: progress.serviceType,
      totalCost: this.calculateBookingPrice(progress)
    };
  }

  // Get total steps based on service type
  getTotalSteps(bookingData) {
    if (bookingData.serviceType === 'fabric-only') {
      return 3; // Fabric, Review, Confirm
    }
    return 6; // Fabric, Review, Design, Tailor, Measurements, Confirm
  }

  // Get completed steps
  getCompletedSteps(bookingData) {
    let completed = 0;
    
    if (bookingData.selectedFabric) completed++;
    if (bookingData.serviceType) completed++;
    if (bookingData.selectedDesign) completed++;
    if (bookingData.selectedTailor) completed++;
    if (bookingData.measurementId || Object.keys(bookingData.customMeasurements || {}).length > 0) completed++;
    
    return completed;
  }

  // Get progress percentage
  getProgressPercentage(bookingData) {
    const completed = this.getCompletedSteps(bookingData);
    const total = this.getTotalSteps(bookingData);
    return Math.round((completed / total) * 100);
  }

  // Resume booking from specific step
  resumeFromStep(step) {
    const progress = this.getBookingProgress();
    if (!progress) return null;
    
    return {
      ...progress,
      currentStep: step,
      resumedAt: new Date().toISOString()
    };
  }
}

export default BookingCacheService;
