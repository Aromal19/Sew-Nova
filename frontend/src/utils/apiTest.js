// Simple API test utility
import { apiCall } from '../config/api.js';

export const testCustomerServiceConnection = async () => {
  try {
    console.log('Testing Customer Service connection...');
    
    // Test basic connectivity first
    const result = await apiCall('CUSTOMER_SERVICE', '/health');
    console.log('✅ Customer Service is running:', result);
    
    // Test addresses endpoint
    const addressesResult = await apiCall('CUSTOMER_SERVICE', '/api/addresses/test');
    console.log('✅ Addresses endpoint accessible:', addressesResult);
    
    return true;
  } catch (error) {
    console.error('❌ Customer Service connection failed:', error);
    console.error('Make sure the Customer Service is running on port 3001');
    console.error('Run: cd backend/customer-service && node start-dev.js');
    return false;
  }
};

export const testAuthServiceConnection = async () => {
  try {
    console.log('Testing Auth Service connection...');
    const result = await apiCall('AUTH_SERVICE', '/health');
    console.log('✅ Auth Service is running:', result);
    return true;
  } catch (error) {
    console.error('❌ Auth Service connection failed:', error);
    return false;
  }
};

// Test without authentication
export const testCustomerServiceBasic = async () => {
  try {
    console.log('Testing Customer Service basic connectivity...');
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Customer Service basic test:', result);
    return true;
  } catch (error) {
    console.error('❌ Customer Service basic test failed:', error);
    console.error('Full error details:', error);
    return false;
  }
}; 