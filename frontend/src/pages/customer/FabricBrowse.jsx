import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiHeart, 
  FiShoppingCart,
  FiStar,
  FiTag,
  FiUser,
  FiMapPin,
  FiX,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { apiCall } from "../../config/api";
import { useCart } from "../../context/CartContext";

const FabricBrowse = () => {
  const navigate = useNavigate();
  const { addFabricToCart } = useCart();
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = [
    "all", "cotton", "silk", "linen", "wool", "polyester", "denim", "chiffon", "georgette"
  ];

  const colors = [
    "all", "red", "blue", "green", "yellow", "black", "white", "pink", "purple", "orange", "brown", "gray"
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" }
  ];

  useEffect(() => {
    fetchFabrics();
  }, [searchQuery, selectedCategory, selectedColor, priceRange, sortBy]);

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: 1,
        limit: 50,
        isActive: true
      };
      
      // Add search query
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Add category filter
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      
      // Add color filter
      if (selectedColor !== "all") {
        params.color = selectedColor;
      }
      
      // Add price range
      if (priceRange.min > 0) {
        params.minPrice = priceRange.min;
      }
      if (priceRange.max < 5000) {
        params.maxPrice = priceRange.max;
      }
      
      // Add sorting
      switch (sortBy) {
        case "newest":
          params.sortBy = "createdAt";
          params.sortOrder = "desc";
          break;
        case "oldest":
          params.sortBy = "createdAt";
          params.sortOrder = "asc";
          break;
        case "price_low":
          params.sortBy = "price";
          params.sortOrder = "asc";
          break;
        case "price_high":
          params.sortBy = "price";
          params.sortOrder = "desc";
          break;
        case "rating":
          params.sortBy = "rating";
          params.sortOrder = "desc";
          break;
        case "popular":
          params.sortBy = "reviews";
          params.sortOrder = "desc";
          break;
      }
      
      const response = await apiCall('SELLER_SERVICE', '/api/public/products', {
        method: 'GET'
      });
      
      if (response.success && response.data) {
        // Transform the data to match our component structure
        const transformedFabrics = response.data.map(product => ({
          _id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          pricePerUnit: product.pricePerUnit || 'per meter',
          color: product.color,
          pattern: product.pattern || 'Solid',
          weight: product.weight,
          width: product.width,
          images: product.images ? product.images.map(img => img.url || img) : [],
          stock: product.stock || 0,
          tags: product.tags || [],
          seller: {
            _id: product.seller?._id,
            name: product.seller?.name || 'Unknown Seller',
            businessName: product.seller?.businessName,
            businessType: product.seller?.businessType,
            isVerified: product.seller?.isVerified || false,
            aadhaarVerified: product.seller?.aadhaarVerified || false,
            rating: product.seller?.rating || 4.0,
            totalSales: product.seller?.totalSales || 0,
            profileImage: product.seller?.profileImage,
            location: product.seller?.location || 'Location not specified'
          },
          rating: product.rating?.average || 4.0,
          reviews: product.rating?.count || 0,
          createdAt: product.createdAt
        }));
        
        setFabrics(transformedFabrics);
      } else {
        console.error('Failed to fetch fabrics:', response.message);
        setFabrics([]);
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      setFabrics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = (fabricId) => {
    const newWishlisted = new Set(wishlistedItems);
    if (newWishlisted.has(fabricId)) {
      newWishlisted.delete(fabricId);
    } else {
      newWishlisted.add(fabricId);
    }
    setWishlistedItems(newWishlisted);
    // TODO: API call to update wishlist
  };

  const handleAddToCart = (fabric) => {
    addFabricToCart({
      id: fabric._id,
      name: fabric.name,
      price: fabric.price,
      image: fabric.images?.[0],
    });
    // Navigate to cart for immediate feedback
    navigate('/customer/cart');
  };

  const handleViewDetails = (fabricId) => {
    navigate(`/customer/fabric/${fabricId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedColor("all");
    setPriceRange({ min: 0, max: 5000 });
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="fabrics" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fabrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="fabrics" />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Fabrics</h1>
              <p className="text-gray-600 mt-1">Find the perfect fabric for your next project</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filters
                {showFilters ? <FiChevronUp className="w-4 h-4 ml-2" /> : <FiChevronDown className="w-4 h-4 ml-2" />}
              </button>
              
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fabrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {colors.map(color => (
                      <option key={color} value={color} className="capitalize">
                        {color === "all" ? "All Colors" : color}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 5000 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {fabrics.length} fabric{fabrics.length !== 1 ? 's' : ''}
          </p>
        </div>

        {fabrics.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {fabrics.map((fabric) => (
              <div key={fabric._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="relative">
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={fabric.images[0]}
                      alt={fabric.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleWishlistToggle(fabric._id)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      wishlistedItems.has(fabric._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${wishlistedItems.has(fabric._id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                      {fabric.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{fabric.name}</h3>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{fabric.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{fabric.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: fabric.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{fabric.pattern}</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{fabric.price}/m</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span>{fabric.seller.name}</span>
                        {fabric.seller.isVerified && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-1" />
                        <span>{fabric.seller.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{fabric.seller.businessType}</span>
                      {fabric.seller.totalSales > 0 && (
                        <span>{fabric.seller.totalSales} sales</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(fabric._id)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(fabric)}
                      className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      <FiShoppingCart className="w-4 h-4 inline mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No fabrics found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FabricBrowse;