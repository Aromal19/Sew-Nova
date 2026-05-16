import React, { useState, useEffect } from 'react';
import { apiCall } from '../config/api';

const DesignSelection = ({ onDesignSelect, selectedDesignId = null, initialCategory = 'all' }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch designs from API
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      
      const endpoint = `/api/designs${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🔍 Fetching designs from:', endpoint);
      
      const response = await apiCall('DESIGN_SERVICE', endpoint);
      console.log('📊 API Response:', response);
      
      if (response.success) {
        setDesigns(response.data);
        console.log(`✅ Loaded ${response.data.length} designs from database`);
      } else {
        setError('Failed to fetch designs');
        console.error('❌ API returned success: false');
      }
    } catch (err) {
      console.error('❌ Error fetching designs:', err);
      setError('Error loading designs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await apiCall('DESIGN_SERVICE', '/api/designs/categories');
      console.log('📊 Categories response:', response);
      
      if (response.success) {
        setCategories(['all', ...response.data]);
        console.log(`✅ Loaded ${response.data.length} categories from database`);
      } else {
        console.error('❌ Failed to fetch categories');
      }
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchDesigns();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const handleDesignClick = (design) => {
    if (onDesignSelect) {
      onDesignSelect(design);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      formal: 'bg-purple-100 text-purple-800',
      casual: 'bg-blue-100 text-blue-800',
      traditional: 'bg-orange-100 text-orange-800',
      western: 'bg-indigo-100 text-indigo-800',
      ethnic: 'bg-pink-100 text-pink-800',
      party: 'bg-pink-100 text-pink-800',
      wedding: 'bg-rose-100 text-rose-800',
      office: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading designs from database...</p>
        <p className="text-sm text-gray-500">Fetching from Design Service API</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Designs</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDesigns}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Designs
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, description, or tags..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {designs.length} design{designs.length !== 1 ? 's' : ''} found
        {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Designs Grid */}
      {designs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Designs Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No designs are available at the moment.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {designs.map((design) => (
            <div
              key={design._id}
              onClick={() => handleDesignClick(design)}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedDesignId === design._id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {/* Design Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                <img
                  src={design.image || (design.images && design.images.length > 0 ? (design.images[0].url || design.images[0]) : null)}
                  alt={design.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTM0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlc2lnbiBJbWFnZTwvdGV4dD4KPC9zdmc+';
                  }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(design.category)}`}>
                    {design.category}
                  </span>
                </div>
                
                {/* Difficulty Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(design.difficulty)}`}>
                    {design.difficulty}
                  </span>
                </div>
              </div>

              {/* Design Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm">
                  {design.name}
                </h3>
                
                {design.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                    {design.description}
                  </p>
                )}

                {/* Price and Time */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  {design.price && (
                    <span className="font-medium text-green-600">
                      ₹{design.price}
                    </span>
                  )}
                  {design.estimatedTime && (
                    <span>
                      {design.estimatedTime}h
                    </span>
                  )}
                </div>

                {/* Tags */}
                {(() => {
                  // Debug logging
                  console.log('Design tags debug:', {
                    designId: design._id,
                    tags: design.tags,
                    tagsType: typeof design.tags,
                    isArray: Array.isArray(design.tags)
                  });
                  
                  // Handle tags safely - convert to array if needed
                  let tagsArray = [];
                  if (design.tags) {
                    if (Array.isArray(design.tags)) {
                      tagsArray = design.tags;
                    } else if (typeof design.tags === 'string') {
                      // Split comma-separated string into array
                      tagsArray = design.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    }
                  }
                  
                  return tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {tagsArray.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {tagsArray.length > 2 && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{tagsArray.length - 2}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Database indicator */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    DB
                  </span>
                  {design.sizeCriteria && design.sizeCriteria.length > 0 && (
                    <span className="text-blue-600 text-xs">
                      {design.sizeCriteria.length} sizes
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignSelection;
