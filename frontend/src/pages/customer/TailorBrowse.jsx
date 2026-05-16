import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiHeart, 
  FiUser,
  FiStar,
  FiMapPin,
  FiAward,
  FiClock,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiScissors,
  FiMessageCircle,
  FiPhone,
  FiCheckCircle
} from "react-icons/fi";
import { apiCall } from "../../config/api";
import Sidebar from "../../components/Sidebar";

const TailorBrowse = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [experienceFilter, setExperienceFilter] = useState({ min: 0, max: 50 });
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favoritedItems, setFavoritedItems] = useState(new Set());

  const specializations = [
    "all", "Men's Clothing", "Women's Clothing", "Children's Clothing", 
    "Wedding Dresses", "Formal Wear", "Casual Wear", "Alterations", 
    "Custom Design", "Traditional Wear", "Western Wear"
  ];

  const locations = [
    "all", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"
  ];

  const sortOptions = [
    { value: "rating", label: "Highest Rated" },
    { value: "experience", label: "Most Experienced" },
    { value: "reviews", label: "Most Reviews" },
    { value: "newest", label: "Newest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" }
  ];

  useEffect(() => {
    fetchTailors();
  }, [searchQuery, selectedSpecialization, selectedLocation, ratingFilter, experienceFilter, sortBy]);

  const fetchTailors = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: 1,
        limit: 50,
        isVerified: true
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedSpecialization !== "all") params.specialization = selectedSpecialization;
      if (selectedLocation !== "all") params.city = selectedLocation;
      if (ratingFilter > 0) params.minRating = ratingFilter;
      if (experienceFilter.min > 0) params.minExperience = experienceFilter.min;
      if (experienceFilter.max < 50) params.maxExperience = experienceFilter.max;
      
      switch (sortBy) {
        case "rating":
          params.sortBy = "rating";
          params.sortOrder = "desc";
          break;
        case "experience":
          params.sortBy = "experience";
          params.sortOrder = "desc";
          break;
        case "reviews":
          params.sortBy = "totalOrders";
          params.sortOrder = "desc";
          break;
        case "newest":
          params.sortBy = "createdAt";
          params.sortOrder = "desc";
          break;
        case "price_low":
          params.sortBy = "basePrice";
          params.sortOrder = "asc";
          break;
        case "price_high":
          params.sortBy = "basePrice";
          params.sortOrder = "desc";
          break;
      }
      
      const response = await apiCall('TAILOR_SERVICE', '/api/public/tailors', {
        method: 'GET'
      });
      
      if (response.success && response.data) {
        const transformedTailors = response.data.map(t => ({
          _id: t._id,
          firstname: t.firstname,
          lastname: t.lastname,
          shopName: t.shopName,
          rating: t.rating || 4.0,
          totalReviews: t.totalOrders || 0,
          experience: t.experience || 0,
          location: {
            address: t.address || "Address not specified",
            city: t.district || t.city || "Unknown",
            state: t.state || "Unknown",
            pincode: t.pincode || "Unknown"
          },
          specializations: t.specialization || [],
          services: t.services || [
            {
              name: "Custom Tailoring",
              price: t.basePrice || 2000,
              duration: "7-10 days"
            }
          ],
          availability: t.availability || {},
          responseTime: t.responseTime || "2 hours",
          completionRate: t.completionRate || 95
        }));
        
        setTailors(transformedTailors);
      } else {
        console.error('Failed to fetch tailors:', response.message);
        setTailors([]);
      }
    } catch (error) {
      console.error('Error fetching tailors:', error);
      setTailors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (tailorId) => {
    const newFavorited = new Set(favoritedItems);
    if (newFavorited.has(tailorId)) {
      newFavorited.delete(tailorId);
    } else {
      newFavorited.add(tailorId);
    }
    setFavoritedItems(newFavorited);
  };

  const handleViewDetails = (tailorId) => {
    navigate(`/customer/tailor/${tailorId}`);
  };

  const handleContact = (tailor, method) => {
    if (method === 'phone') {
      window.open(`tel:${tailor.phone || ''}`);
    } else if (method === 'message') {
      console.log('Message tailor:', tailor._id);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialization("all");
    setSelectedLocation("all");
    setRatingFilter(0);
    setExperienceFilter({ min: 0, max: 50 });
    setSortBy("rating");
  };

  const getAvailabilityStatus = (tailor) => {
    const now = new Date();
    const dayIndex = now.getDay();
    const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const day = dayKeys[dayIndex];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaySchedule = tailor.availability && tailor.availability[day];
    if (!todaySchedule || !todaySchedule.available) {
      return { status: 'closed', message: 'Closed today' };
    }
    
    if (currentTime >= todaySchedule.start && currentTime <= todaySchedule.end) {
      return { status: 'open', message: 'Open now' };
    } else {
      return { status: 'closed', message: `Opens at ${todaySchedule.start}` };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tailors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Expert Tailors</h1>
                <p className="text-sm text-gray-600 mt-1">Browse skilled professionals for your tailoring needs</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
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
                  placeholder="Search tailors by name, location, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>
                          {spec === "all" ? "All Specializations" : spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>
                          {loc === "all" ? "All Locations" : loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                      <option value={0}>All Ratings</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {tailors.length} tailor{tailors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {tailors.length > 0 ? (
          <div className={`grid gap-5 ${
            viewMode === "grid" 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {tailors.map((tailor) => {
              const availability = getAvailabilityStatus(tailor);
              
              return (
                <div key={tailor._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  {/* Card Header with Avatar */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-5">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                        <FiUser className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
                          {tailor.firstname} {tailor.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{tailor.shopName}</p>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(tailor.rating)
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-semibold text-gray-700">
                              {tailor.rating}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">({tailor.totalReviews})</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleFavoriteToggle(tailor._id)}
                        className={`p-2 rounded-full transition-all flex-shrink-0 ${
                          favoritedItems.has(tailor._id)
                            ? 'bg-red-100 text-red-500 shadow-sm'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <FiHeart className={`w-4 h-4 ${favoritedItems.has(tailor._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Location & Experience */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{tailor.location.city}, {tailor.location.state}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
                        <FiAward className="w-4 h-4 mr-1" />
                        {tailor.experience} years
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {tailor.specializations.slice(0, 2).map((spec, index) => (
                          <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
                            {spec}
                          </span>
                        ))}
                        {tailor.specializations.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            +{tailor.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Services & Pricing</h4>
                      <div className="space-y-2">
                        {tailor.services.slice(0, 2).map((service, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 truncate mr-2">{service.name}</span>
                            <span className="font-semibold text-gray-900 flex-shrink-0">₹{service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">Response Time</div>
                        <div className="font-semibold text-gray-900 text-sm">{tailor.responseTime}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs mb-1">Success Rate</div>
                        <div className="font-semibold text-gray-900 text-sm">{tailor.completionRate}%</div>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className="mb-4">
                      <div className={`flex items-center text-sm px-3 py-1.5 rounded-full inline-flex ${
                        availability.status === 'open' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <FiClock className="w-4 h-4 mr-1.5" />
                        {availability.message}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleViewDetails(tailor._id)}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
                      >
                        View Profile
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFavoriteToggle(tailor._id)}
                          className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                            favoritedItems.has(tailor._id)
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FiHeart className={`w-4 h-4 inline mr-1 ${favoritedItems.has(tailor._id) ? 'fill-current' : ''}`} />
                          {favoritedItems.has(tailor._id) ? 'Saved' : 'Save'}
                        </button>
                        
                        <button
                          onClick={() => handleContact(tailor, 'phone')}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                        >
                          <FiPhone className="w-4 h-4 inline mr-1" />
                          Call
                        </button>
                        
                        <button
                          onClick={() => handleContact(tailor, 'message')}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
                        >
                          <FiMessageCircle className="w-4 h-4 inline mr-1" />
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiScissors className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tailors found</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md text-sm font-medium"
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

export default TailorBrowse;