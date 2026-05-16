// Environment configuration for SewNova Frontend
const config = {
  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  CUSTOMER_SERVICE_URL: import.meta.env.VITE_CUSTOMER_SERVICE_URL || 'http://localhost:3002',
  ADMIN_SERVICE_URL: import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:3003',
  DESIGN_SERVICE_URL: import.meta.env.VITE_DESIGN_SERVICE_URL || 'http://localhost:3004',
  TAILOR_SERVICE_URL: import.meta.env.VITE_TAILOR_SERVICE_URL || 'http://localhost:3003',
  VENDOR_SERVICE_URL: import.meta.env.VITE_VENDOR_SERVICE_URL || 'http://localhost:3006',
  PAYMENT_SERVICE_URL: import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3007',
  MEASUREMENT_SERVICE_URL: import.meta.env.VITE_MEASUREMENT_SERVICE_URL || 'http://localhost:8001',

  // Authentication
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // Payment
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',

  // Image Upload
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  CLOUDINARY_URL: import.meta.env.VITE_CLOUDINARY_URL || '',

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SewNova',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  CORS_ORIGIN: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:5173',
};

export default config;
