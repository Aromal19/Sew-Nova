/**
 * Razorpay utility functions for handling payment integration
 */

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      // Wait for script to load
      const checkLoaded = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };
    document.head.appendChild(script);
  });
};

// Create Razorpay instance with error handling
export const createRazorpayInstance = (options) => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.Razorpay) {
        reject(new Error('Razorpay is not available'));
        return;
      }

      const rzp = new window.Razorpay(options);
      resolve(rzp);
    } catch (error) {
      reject(error);
    }
  });
};

// Enhanced Razorpay options with better error handling
export const createRazorpayOptions = (orderData, onSuccess, onError, onDismiss) => {
  return {
    key: orderData.key,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: "SewNova",
    description: "Order Payment",
    order_id: orderData.order.id,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss
    },
    prefill: {
      name: "",
      email: "",
      contact: ""
    },
    notes: {
      source: "sewnova-booking"
    },
    theme: { 
      color: "#f59e0b",
      backdrop_color: "#000000",
      hide_topbar: false
    },
    readonly: {
      email: false,
      contact: false,
      name: false
    },
    // Additional options to prevent common errors
    retry: {
      enabled: true,
      max_count: 3
    },
    timeout: 300000, // 5 minutes
    remember_customer: false
  };
};

// Handle Razorpay errors gracefully
export const handleRazorpayError = (error) => {
  console.error('Razorpay Error:', error);
  
  // Common error messages
  const errorMessages = {
    'NETWORK_ERROR': 'Network error. Please check your internet connection.',
    'PAYMENT_CANCELLED': 'Payment was cancelled by user.',
    'PAYMENT_FAILED': 'Payment failed. Please try again.',
    'INVALID_AMOUNT': 'Invalid payment amount.',
    'ORDER_NOT_FOUND': 'Payment order not found. Please try again.'
  };

  const message = errorMessages[error.code] || 'Payment failed. Please try again.';
  return message;
};
