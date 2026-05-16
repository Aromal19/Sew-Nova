/**
 * Global error handler for handling browser and Razorpay errors
 */

// Handle unsafe header errors from Razorpay
export const handleUnsafeHeaderError = () => {
  // Override XMLHttpRequest to handle unsafe headers
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // Handle unsafe headers gracefully
    this.addEventListener('error', function(event) {
      console.warn('XMLHttpRequest error handled:', event);
    });
    
    return originalSend.apply(this, arguments);
  };
};

// Handle SVG width errors
export const handleSVGErrors = () => {
  // Override console.error to filter out SVG width errors
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Expected length, "auto"')) {
      // Filter out SVG width errors
      return;
    }
    originalError.apply(console, args);
  };
};

// Initialize error handlers
export const initializeErrorHandlers = () => {
  handleUnsafeHeaderError();
  handleSVGErrors();
  
  // Handle global unhandled errors
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('x-rtb-fingerprint-id')) {
      console.warn('Razorpay fingerprint header blocked - this is normal');
      event.preventDefault();
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('x-rtb-fingerprint-id')) {
      console.warn('Razorpay fingerprint header blocked - this is normal');
      event.preventDefault();
    }
  });
};
