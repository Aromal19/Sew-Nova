import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import MeasurementForm from "../../components/customer/MeasurementForm";
import AIMeasurementService from "../../components/customer/AIMeasurementService";
import axios from "axios";
import { getApiUrl } from "../../config/api";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiStar, 
  FiUser, 
  FiBarChart2, 
  FiHeart,
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiCamera,
  FiCheck
} from "react-icons/fi";

const CustomerMeasurements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAIService, setShowAIService] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("measurements");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Token refresh and request wrapper (shared across handlers)
  const refreshAccessToken = async () => {
    try {
      const refreshUrl = getApiUrl('AUTH_SERVICE', '/api/auth/refresh-token');
      const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });
      if (data?.success && data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        return data.accessToken;
      }
    } catch (_) {}
    return null;
  };

  const axiosRequest = async (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    try {
      return await axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        withCredentials: true,
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return await axios({
            ...config,
            headers: {
              ...(config.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
            withCredentials: true,
          });
        }
      }
      throw err;
    }
  };

  // Fetch measurements from DB using GET
  const loadMeasurements = async () => {
    const url = getApiUrl('CUSTOMER_SERVICE', '/api/measurements');
    const { data } = await axiosRequest({ method: 'GET', url });
    const list = Array.isArray(data?.data) ? data.data : [];
    const mapped = list.map(item => ({
      id: item._id,
      measurementName: item.measurementName,
      measurementType: item.measurementType,
      gender: item.gender,
      ageGroup: item.ageGroup,
      chest: item.chest,
      waist: item.waist,
      hip: item.hip,
      shoulder: item.shoulder,
      sleeveLength: item.sleeveLength,
      sleeveWidth: item.sleeveWidth,
      neck: item.neck,
      inseam: item.inseam,
      thigh: item.thigh,
      knee: item.knee,
      ankle: item.ankle,
      isDefault: item.isDefault,
      isActive: item.isActive,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
      lastUsed: item.lastUsed ? new Date(item.lastUsed).toISOString().split('T')[0] : '',
    }));
    setMeasurements(mapped);
  };

  // Load measurements from backend
  useEffect(() => {
    (async () => {
      try {
        await loadMeasurements();
      } catch (e) {
        console.error('Error loading measurements:', e);
        setMeasurements([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddMeasurement = () => {
    setEditingMeasurement(null);
    setShowForm(true);
  };

  const handleAIMeasurement = () => {
    setShowAIService(true);
  };

  const handleAIMeasurementsGenerated = async (aiMeasurements) => {
    try {
      // Create a new measurement directly with AI data
      const measurementData = {
        measurementName: 'AI Generated Measurements',
        measurementType: 'custom',
        gender: 'unisex',
        ageGroup: 'adult',
        ...aiMeasurements,
        isDefault: false,
        isActive: true
      };

      // Save the AI measurement directly to the database
      const url = getApiUrl('CUSTOMER_SERVICE', '/api/measurements');
      await axiosRequest({ method: 'POST', url, data: measurementData });
      
      // Refresh the measurements list
      await loadMeasurements();
      
      // Close the AI service
      setShowAIService(false);
      
      // Show success message
      setSuccessMessage('AI measurement saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving AI measurement:', error);
      // If direct save fails, fall back to form pre-fill
      setEditingMeasurement({
        measurementName: 'AI Generated Measurements',
        measurementType: 'custom',
        gender: 'unisex',
        ageGroup: 'adult',
        ...aiMeasurements,
        isDefault: false
      });
      setShowForm(true);
      setShowAIService(false);
    }
  };

  const handleEditMeasurement = (measurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleDeleteMeasurement = async (id) => {
    if (window.confirm("Are you sure you want to delete this measurement?")) {
      try {
        const url = getApiUrl('CUSTOMER_SERVICE', `/api/measurements/${id}`);
        await axiosRequest({ method: 'DELETE', url });
        await loadMeasurements();
        // Show success message
      } catch (error) {
        console.error("Error deleting measurement:", error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const url = getApiUrl('CUSTOMER_SERVICE', `/api/measurements/${id}/set-default`);
      await axiosRequest({ method: 'PATCH', url });
      setMeasurements(measurements.map(m => ({ ...m, isDefault: m.id === id })));
      // Show success message
    } catch (error) {
      console.error("Error setting default measurement:", error);
    }
  };

  const handleFormSubmit = async (measurementData) => {
    try {
      if (editingMeasurement) {
        const url = getApiUrl('CUSTOMER_SERVICE', `/api/measurements/${editingMeasurement.id}`);
        await axiosRequest({ method: 'PUT', url, data: measurementData });
        await loadMeasurements();
      } else {
        const url = getApiUrl('CUSTOMER_SERVICE', '/api/measurements');
        const { data } = await axiosRequest({ method: 'POST', url, data: measurementData });
        await loadMeasurements();
      }
      setShowForm(false);
      setEditingMeasurement(null);
      // Show success message
    } catch (error) {
      console.error("Error saving measurement:", error);
    }
  };

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch = measurement.measurementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         measurement.measurementType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || measurement.measurementType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getMeasurementTypeIcon = (type) => {
    switch (type) {
      case "casual": return "👕";
      case "formal": return "👔";
      case "party": return "🎉";
      case "traditional": return "🕉️";
      case "western": return "👗";
      default: return "📏";
    }
  };

  const getGenderIcon = (gender) => {
    return gender === "male" ? "👨" : "👩";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="measurements" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading measurements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="measurements" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Measurements</h1>
                <p className="text-gray-600 mt-1">Manage your custom measurements for perfect fitting clothes</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAIMeasurement}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  <FiCamera className="w-4 h-4 mr-2" />
                  AI Measurements
                </button>
                <button
                  onClick={handleAddMeasurement}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Measurement
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search measurements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="party">Party</option>
                  <option value="traditional">Traditional</option>
                  <option value="western">Western</option>
                </select>
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" 
                      ? 'bg-amber-500 text-white' 
                      : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" 
                      ? 'bg-amber-500 text-white' 
                      : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <FiCheck className="w-5 h-5 text-green-500" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <FiBarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Measurements</p>
                    <p className="text-2xl font-bold text-gray-900">{measurements.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <FiStar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Default Set</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {measurements.filter(m => m.isDefault).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {measurements.filter(m => m.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <FiHeart className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recently Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {measurements.filter(m => m.lastUsed === new Date().toISOString().split('T')[0]).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurements Grid/List */}
            {filteredMeasurements.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredMeasurements.map((measurement) => (
                  <div key={measurement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getMeasurementTypeIcon(measurement.measurementType)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {measurement.measurementName}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{getGenderIcon(measurement.gender)}</span>
                              <span className="capitalize">{measurement.gender}</span>
                              <span>•</span>
                              <span className="capitalize">{measurement.ageGroup}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {measurement.isDefault && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Default
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            measurement.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {measurement.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Key Measurements */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Chest</p>
                          <p className="font-semibold text-gray-900">{measurement.chest}"</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Waist</p>
                          <p className="font-semibold text-gray-900">{measurement.waist}"</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Hip</p>
                          <p className="font-semibold text-gray-900">{measurement.hip}"</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Shoulder</p>
                          <p className="font-semibold text-gray-900">{measurement.shoulder}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600">
                          <p>Created: {measurement.createdAt}</p>
                          <p>Last used: {measurement.lastUsed}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMeasurement(measurement)}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FiEdit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        
                        {!measurement.isDefault && (
                          <button
                            onClick={() => handleSetDefault(measurement.id)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                          >
                            <FiStar className="w-4 h-4 mr-2" />
                            Set Default
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteMeasurement(measurement.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBarChart2 className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No measurements found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first measurement"
                  }
                </p>
                {!searchQuery && filterType === "all" && (
                  <button
                    onClick={handleAddMeasurement}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
                  >
                    <FiPlus className="w-4 h-4 mr-2 inline" />
                    Add First Measurement
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Measurement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMeasurement ? 'Edit Measurement' : 'Add New Measurement'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeasurement(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <MeasurementForm
                measurement={editingMeasurement}
                isEditing={Boolean(editingMeasurement)}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMeasurement(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Measurement Service Modal */}
      {showAIService && (
        <AIMeasurementService
          onMeasurementsGenerated={handleAIMeasurementsGenerated}
          onClose={() => setShowAIService(false)}
        />
      )}
    </div>
  );
};

export default CustomerMeasurements; 