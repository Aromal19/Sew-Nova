// Test file to verify API exports
import { apiCall, getApiUrl } from './api.js';

console.log('Testing API exports...');

// Test getApiUrl
try {
  const url = getApiUrl('CUSTOMER_SERVICE', '/health');
  console.log('✅ getApiUrl working:', url);
} catch (error) {
  console.error('❌ getApiUrl failed:', error);
}

// Test apiCall function exists
if (typeof apiCall === 'function') {
  console.log('✅ apiCall function is exported');
} else {
  console.error('❌ apiCall function is not exported');
}

console.log('API test completed'); 