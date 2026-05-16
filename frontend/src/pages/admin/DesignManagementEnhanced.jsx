import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiImage,
  FiTag,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiUpload,
  FiSave,
  FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/api";
import { adminApiService } from "../../services/adminApiService";
import API_CONFIG from "../../config/api";

const DesignManagementEnhanced = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Design data states
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPerPage] = useState(10);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    images: [],
    tags: "",
    difficulty: "intermediate",
    estimatedTime: "",
    sizeCriteria: [],
    requiredMeasurements: []
  });

  // Sizing and measurement states
  const [availableSizing, setAvailableSizing] = useState([]);
  const [availableMeasurements, setAvailableMeasurements] = useState([]);
  const [selectedSizing, setSelectedSizing] = useState([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      loadDesigns();
      loadCategories();
      loadStats();
      loadSizingOptions();
      loadMeasurementOptions();
    }
  }, [navigate]);

  useEffect(() => {
    filterDesigns();
  }, [designs, searchTerm, selectedCategory, statusFilter]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const response = await adminApiService.getDesigns({
        page: 1,
        limit: 100
      });
      
      if (response.success) {
        setDesigns(response.data.designs || []);
      } else {
        throw new Error('Failed to load designs');
      }
    } catch (err) {
      console.error('Error loading designs:', err);
      setError('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminApiService.getDesignCategories();
      
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApiService.getDesignStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadSizingOptions = async () => {
    try {
      const response = await fetch(`${API_CONFIG.SELLER_SERVICE}/api/sizing`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSizing(data.data || []);
      }
    } catch (err) {
      console.error('Error loading sizing options:', err);
    }
  };

  const loadMeasurementOptions = async () => {
    try {
      const response = await fetch(`${API_CONFIG.SELLER_SERVICE}/api/measurements`);
      if (response.ok) {
        const data = await response.json();
        setAvailableMeasurements(data.data || []);
      }
    } catch (err) {
      console.error('Error loading measurement options:', err);
    }
  };

  const filterDesigns = () => {
    let filtered = designs;
    
    if (searchTerm) {
      filtered = filtered.filter(design => 
        design.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(design => design.category === selectedCategory);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(design => 
        statusFilter === "active" ? design.isActive : !design.isActive
      );
    }
    
    setFilteredDesigns(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      images: [],
      tags: "",
      difficulty: "intermediate",
      estimatedTime: "",
      sizeCriteria: [],
      requiredMeasurements: []
    });
    setSelectedDesign(null);
    setSelectedSizing([]);
    setSelectedMeasurements([]);
  };

  const handleSizingToggle = (sizeId) => {
    setSelectedSizing(prev => {
      if (prev.includes(sizeId)) {
        return prev.filter(id => id !== sizeId);
      } else {
        return [...prev, sizeId];
      }
    });
  };

  const handleMeasurementToggle = (measurementId) => {
    setSelectedMeasurements(prev => {
      if (prev.includes(measurementId)) {
        return prev.filter(id => id !== measurementId);
      } else {
        return [...prev, measurementId];
      }
    });
  };

  const getSizingForCategory = (category) => {
    if (!category) return availableSizing;
    return availableSizing.filter(size => 
      size.gender === category.toLowerCase() || size.gender === 'unisex'
    );
  };

  const handleAddDesign = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const designData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sizeCriteria: selectedSizing,
        requiredMeasurements: selectedMeasurements,
        images: formData.images.length > 0 ? formData.images : [formData.image].filter(Boolean),
        price: parseFloat(formData.price) || 0,
        estimatedTime: parseFloat(formData.estimatedTime) || 0
      };

      const response = await adminApiService.createDesign(designData);

      if (response.success) {
        setShowAddModal(false);
        resetForm();
        loadDesigns();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to create design');
      }
    } catch (err) {
      console.error('Error creating design:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-charcoal">Design Management</h1>
                <p className="text-gray-600 mt-2">Manage and organize your design catalog</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                <FiPlus className="mr-2" />
                Add Design
              </button>
            </div>
          </header>

          {/* Add Design Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-charcoal">Add New Design</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAddDesign} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Design Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Est. Time (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="e.g., elegant, formal, wedding"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  
                  {/* Size Criteria Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Criteria
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {getSizingForCategory(formData.category).map((size) => (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => handleSizingToggle(size.id)}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                              selectedSizing.includes(size.id)
                                ? 'bg-coralblush text-white border-coralblush'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-coralblush hover:bg-coralblush hover:bg-opacity-10'
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                      {selectedSizing.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">Selected sizes:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSizing.map((sizeId) => {
                              const size = availableSizing.find(s => s.id === sizeId);
                              return (
                                <span
                                  key={sizeId}
                                  className="inline-flex items-center px-2 py-1 bg-coralblush text-white text-xs rounded-full"
                                >
                                  {size?.label}
                                  <button
                                    type="button"
                                    onClick={() => handleSizingToggle(sizeId)}
                                    className="ml-1 hover:text-gray-200"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Required Measurements Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Measurements
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableMeasurements.map((measurement) => (
                          <button
                            key={measurement.id}
                            type="button"
                            onClick={() => handleMeasurementToggle(measurement.id)}
                            className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left ${
                              selectedMeasurements.includes(measurement.id)
                                ? 'bg-lilac text-white border-lilac'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-lilac hover:bg-lilac hover:bg-opacity-10'
                            }`}
                          >
                            <div className="font-medium">{measurement.label}</div>
                            <div className="text-xs opacity-75">{measurement.category}</div>
                          </button>
                        ))}
                      </div>
                      {selectedMeasurements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">Selected measurements:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedMeasurements.map((measurementId) => {
                              const measurement = availableMeasurements.find(m => m.id === measurementId);
                              return (
                                <span
                                  key={measurementId}
                                  className="inline-flex items-center px-2 py-1 bg-lilac text-white text-xs rounded-full"
                                >
                                  {measurement?.label}
                                  <button
                                    type="button"
                                    onClick={() => handleMeasurementToggle(measurementId)}
                                    className="ml-1 hover:text-gray-200"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                      {loading ? 'Creating...' : 'Create Design'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DesignManagementEnhanced;
