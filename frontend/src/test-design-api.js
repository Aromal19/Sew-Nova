// Test script to verify frontend can connect to design service
import { apiCall } from './config/api.js';

const testDesignAPI = async () => {
  console.log('🧪 Testing Design API from Frontend...');
  
  try {
    // Test 1: Get all designs
    console.log('1. Testing get all designs...');
    const allDesigns = await apiCall('DESIGN_SERVICE', '/api/designs');
    console.log('✅ All designs:', {
      success: allDesigns.success,
      count: allDesigns.count,
      sampleDesign: allDesigns.data[0] ? {
        name: allDesigns.data[0].name,
        category: allDesigns.data[0].category,
        hasImage: !!allDesigns.data[0].image,
        hasSizeCriteria: !!allDesigns.data[0].sizeCriteria
      } : 'No designs found'
    });

    // Test 2: Get categories
    console.log('2. Testing get categories...');
    const categories = await apiCall('DESIGN_SERVICE', '/api/designs/categories');
    console.log('✅ Categories:', {
      success: categories.success,
      categories: categories.data
    });

    // Test 3: Filter by category
    console.log('3. Testing filter by category...');
    const casualDesigns = await apiCall('DESIGN_SERVICE', '/api/designs?category=casual');
    console.log('✅ Casual designs:', {
      success: casualDesigns.success,
      count: casualDesigns.count
    });

    console.log('🎉 All frontend API tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Frontend API test failed:', error);
    return false;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  testDesignAPI();
}

export default testDesignAPI;
