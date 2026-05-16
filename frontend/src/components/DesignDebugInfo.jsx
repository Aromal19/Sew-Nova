import React, { useState, useEffect } from 'react';
import { apiCall } from '../config/api';

const DesignDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({
    apiConnected: false,
    designCount: 0,
    categories: [],
    lastFetch: null,
    error: null
  });

  const testConnection = async () => {
    try {
      console.log('🔍 Testing Design Service connection...');
      
      // Test basic connection
      const response = await apiCall('DESIGN_SERVICE', '/api/designs');
      
      if (response.success) {
        setDebugInfo({
          apiConnected: true,
          designCount: response.count,
          categories: [],
          lastFetch: new Date().toLocaleTimeString(),
          error: null
        });
        
        // Test categories
        const categoriesResponse = await apiCall('DESIGN_SERVICE', '/api/designs/categories');
        if (categoriesResponse.success) {
          setDebugInfo(prev => ({
            ...prev,
            categories: categoriesResponse.data
          }));
        }
        
        console.log('✅ Design Service connection successful');
      } else {
        setDebugInfo(prev => ({
          ...prev,
          error: 'API returned success: false'
        }));
      }
    } catch (error) {
      console.error('❌ Design Service connection failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-900">
          🛠️ Design Service Debug Info
        </h3>
        <button
          onClick={testConnection}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-700">API Connection:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              debugInfo.apiConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {debugInfo.apiConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-700">Designs in DB:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {debugInfo.designCount} designs
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-700">Last Fetch:</span>
            <span className="ml-2 text-gray-600">
              {debugInfo.lastFetch || 'Never'}
            </span>
          </div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700 mb-2">Categories Available:</div>
          <div className="flex flex-wrap gap-1">
            {debugInfo.categories.map(category => (
              <span
                key={category}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {category}
              </span>
            ))}
          </div>
          
          {debugInfo.error && (
            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-xs">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <strong>API Endpoint:</strong> http://localhost:3006/api/designs
      </div>
    </div>
  );
};

export default DesignDebugInfo;
