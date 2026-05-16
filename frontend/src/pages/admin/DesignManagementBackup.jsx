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

const DesignManagement = () => {
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

  const handleEditDesign = async (e) => {
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

      const response = await adminApiService.updateDesign(selectedDesign._id, designData);

      if (response.success) {
        setShowEditModal(false);
        resetForm();
        loadDesigns();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to update design');
      }
    } catch (err) {
      console.error('Error updating design:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async () => {
    setLoading(true);
    
    try {
      const response = await adminApiService.deleteDesign(selectedDesign._id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedDesign(null);
        loadDesigns();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to delete design');
      }
    } catch (err) {
      console.error('Error deleting design:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const openEditModal = (design) => {
    setSelectedDesign(design);
    setFormData({
      name: design.name || "",
      category: design.category || "",
      description: design.description || "",
      price: design.price || "",
      image: design.image || "",
      tags: design.tags?.join(', ') || "",
      difficulty: design.difficulty || "intermediate",
      estimatedTime: design.estimatedTime || "",
      sizeCriteria: design.sizeCriteria?.join(', ') || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (design) => {
    setSelectedDesign(design);
    setShowDeleteModal(true);
  };

  // Pagination
  const indexOfLastDesign = currentPage * designsPerPage;
  const indexOfFirstDesign = indexOfLastDesign - designsPerPage;
  const currentDesigns = filteredDesigns.slice(indexOfFirstDesign, indexOfLastDesign);
  const totalPages = Math.ceil(filteredDesigns.length / designsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole="admin" 
      />
      
      <main className={`flex-1 transition-all duration-500 ease-in-out ${
        sidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
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

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Designs</p>
                      <p className="text-2xl font-bold text-charcoal">{stats.totalDesigns}</p>
                    </div>
                    <div className="p-3 bg-coralblush bg-opacity-10 rounded-lg">
                      <FiImage className="w-6 h-6 text-coralblush" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Designs</p>
                      <p className="text-2xl font-bold text-charcoal">{stats.activeDesigns}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-charcoal">{Object.keys(stats.categories || {}).length}</p>
                    </div>
                    <div className="p-3 bg-lilac bg-opacity-10 rounded-lg">
                      <FiTag className="w-6 h-6 text-lilac" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Price</p>
                      <p className="text-2xl font-bold text-charcoal">₹{stats.averagePrice}</p>
                    </div>
                    <div className="p-3 bg-champagne bg-opacity-10 rounded-lg">
                      <FiDollarSign className="w-6 h-6 text-champagne" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search designs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Designs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FiLoader className="w-6 h-6 animate-spin mx-auto text-coralblush" />
                        <p className="mt-2 text-gray-500">Loading designs...</p>
                      </td>
                    </tr>
                  ) : currentDesigns.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No designs found
                      </td>
                    </tr>
                  ) : (
                    currentDesigns.map((design) => (
                      <tr key={design._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={design.image || '/images/default-design.jpg'}
                                alt={design.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {design.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {design.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-lilac bg-opacity-10 text-lilac">
                            {design.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{design.price || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            design.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {design.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(design)}
                              className="text-coralblush hover:text-pink-600"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(design)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {indexOfFirstDesign + 1} to {Math.min(indexOfLastDesign, filteredDesigns.length)} of {filteredDesigns.length} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === index + 1
                            ? 'bg-coralblush text-white border-coralblush'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Design Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Criteria (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.sizeCriteria}
                  onChange={(e) => setFormData({...formData, sizeCriteria: e.target.value})}
                  placeholder="e.g., bust, waist, hip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                />
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

      {/* Edit Design Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-charcoal">Edit Design</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditDesign} className="space-y-4">
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
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Criteria (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.sizeCriteria}
                  onChange={(e) => setFormData({...formData, sizeCriteria: e.target.value})}
                  placeholder="e.g., bust, waist, hip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
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
                  {loading ? 'Updating...' : 'Update Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-charcoal">Delete Design</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedDesign?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDesign}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <FiXCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignManagement;
