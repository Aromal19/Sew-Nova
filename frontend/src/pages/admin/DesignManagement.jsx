import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Swal from 'sweetalert2';
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
  FiX,
  FiSettings
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/api";
import { adminApiService } from "../../services/adminApiService";
import API_CONFIG from "../../config/api";

// Garment type options based on category
const GARMENT_OPTIONS = {
  Men: [
    { value: 'shirt', label: 'Shirt' },
    { value: 'pants', label: 'Pants' },
    { value: 'suit', label: 'Suit' },
    { value: 'kurta', label: 'Kurta' },
    { value: 'sherwani', label: 'Sherwani' },
    { value: 'blazer', label: 'Blazer' },
    { value: 'trouser', label: 'Trouser' },
    { value: 'waistcoat', label: 'Waistcoat' },
    { value: 'jacket', label: 'Jacket' },
    { value: 'other', label: 'Other' }
  ],
  Women: [
    { value: 'dress', label: 'Dress' },
    { value: 'saree', label: 'Saree' },
    { value: 'lehenga', label: 'Lehenga' },
    { value: 'salwar-kameez', label: 'Salwar Kameez' },
    { value: 'blouse', label: 'Blouse' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'top', label: 'Top' },
    { value: 'gown', label: 'Gown' },
    { value: 'pants', label: 'Pants' },
    { value: 'other', label: 'Other' }
  ],
  Unisex: [
    { value: 'kurta', label: 'Kurta' },
    { value: 'shirt', label: 'Shirt' },
    { value: 'pants', label: 'Pants' },
    { value: 'jacket', label: 'Jacket' },
    { value: 'other', label: 'Other' }
  ]
};

// Tag options
const TAG_OPTIONS = [
  { value: 'bridal', label: 'Bridal' },
  { value: 'ethnic', label: 'Ethnic Wear' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'party', label: 'Party' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'western', label: 'Western' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'festive', label: 'Festive' },
  { value: 'office', label: 'Office' },
  { value: 'sports', label: 'Sports' },
  { value: 'beach', label: 'Beach' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'evening', label: 'Evening' }
];

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
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPerPage] = useState(15);
  
  // Sorting states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    garmentType: "",
    description: "",
    price: "",
    images: [],
    tags: "",
    difficulty: "intermediate",
    estimatedTime: "",
    requiredMeasurements: []
  });

  // Measurement states
  const [availableMeasurements, setAvailableMeasurements] = useState([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const [measurementFilter, setMeasurementFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      // Redirect to main login page instead of admin login
      navigate("/login", { replace: true });
    } else {
      loadDesigns();
      loadCategories();
      loadStats();
      loadMeasurementOptions();
    }
  }, [navigate]);

  useEffect(() => {
    filterDesigns();
  }, [designs, searchTerm, selectedCategory, statusFilter, difficultyFilter, priceRange, sortBy, sortOrder]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const response = await adminApiService.getDesigns({
        page: 1,
        limit: 100
      });
      
      console.log('🔍 Load Designs Response:', response);
      
      if (response.success) {
        // Backend returns data in 'data' field, not 'data.designs'
        setDesigns(response.data || []);
        console.log('✅ Designs loaded:', response.data?.length || 0);
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
    
    console.log('🔍 Filter Designs Debug:');
    console.log('Total designs:', designs.length);
    console.log('Search term:', searchTerm);
    console.log('Selected category:', selectedCategory);
    console.log('Status filter:', statusFilter);
    console.log('Sort by:', sortBy, 'Order:', sortOrder);
    
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
    
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(design => design.difficulty === difficultyFilter);
    }
    
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-100":
          filtered = filtered.filter(design => (parseFloat(design.price) || 0) < 100);
          break;
        case "100-500":
          filtered = filtered.filter(design => {
            const p = parseFloat(design.price) || 0;
            return p >= 100 && p <= 500;
          });
          break;
        case "500-1000":
          filtered = filtered.filter(design => {
            const p = parseFloat(design.price) || 0;
            return p >= 500 && p <= 1000;
          });
          break;
        case "over-1000":
          filtered = filtered.filter(design => (parseFloat(design.price) || 0) > 1000);
          break;
      }
    }
    
    // Sort the filtered designs
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case "category":
          aValue = a.category?.toLowerCase() || "";
          bValue = b.category?.toLowerCase() || "";
          break;
        case "status":
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case "difficulty":
          const difficultyOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
          aValue = difficultyOrder[a.difficulty] || 2;
          bValue = difficultyOrder[b.difficulty] || 2;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || a.updatedAt || 0);
          bValue = new Date(b.createdAt || b.updatedAt || 0);
          break;
        default:
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    console.log('Filtered and sorted designs:', filtered.length);
    setFilteredDesigns(filtered);
  };

  // Pagination functions
  const getCurrentPageDesigns = () => {
    const startIndex = (currentPage - 1) * designsPerPage;
    const endIndex = startIndex + designsPerPage;
    return filteredDesigns.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredDesigns.length / designsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      garmentType: "",
      description: "",
      price: "",
      images: [],
      tags: "",
      difficulty: "intermediate",
      estimatedTime: "",
      requiredMeasurements: []
    });
    setSelectedDesign(null);
    setSelectedMeasurements([]);
    setMeasurementFilter("all");
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

  const getFilteredMeasurements = () => {
    if (measurementFilter === "all") return availableMeasurements;
    return availableMeasurements.filter(measurement => 
      measurement.category === measurementFilter
    );
  };

  const getSelectedMeasurements = () => {
    return availableMeasurements.filter(measurement => 
      selectedMeasurements.includes(measurement.id)
    );
  };

  const getUnselectedMeasurements = () => {
    return getFilteredMeasurements().filter(measurement => 
      !selectedMeasurements.includes(measurement.id)
    );
  };

  // CRUD Functions
  const handleEditDesign = (design) => {
    setSelectedDesign(design);
    setFormData({
      name: design.name,
      category: design.category,
      garmentType: design.garmentType || '',
      description: design.description || '',
      price: design.price || 0,
      difficulty: design.difficulty || 'intermediate',
      estimatedTime: design.estimatedTime || 0,
      images: design.images || [],
      tags: design.tags || "",
      requiredMeasurements: design.requiredMeasurements || []
    });
    setSelectedMeasurements(design.requiredMeasurements || []);
    setShowEditModal(true);
  };

  const handleDeleteDesign = async (designId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await adminApiService.deleteDesign(designId);
        
        if (response.success) {
          await Swal.fire(
            'Deleted!',
            'Design has been deleted.',
            'success'
          );
          
          // Reload designs
          loadDesigns();
          loadStats();
        } else {
          throw new Error(response.message || 'Failed to delete design');
        }
      }
    } catch (err) {
      console.error('Error deleting design:', err);
      await Swal.fire(
        'Error!',
        'Failed to delete design. Please try again.',
        'error'
      );
    }
  };

  const handleUpdateDesign = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const designData = new FormData();
      designData.append('name', formData.name);
      designData.append('category', formData.category);
      designData.append('garmentType', formData.garmentType);
      designData.append('description', formData.description);
      designData.append('price', formData.price);
      designData.append('difficulty', formData.difficulty);
      designData.append('estimatedTime', formData.estimatedTime);
      designData.append('requiredMeasurements', JSON.stringify(selectedMeasurements));
      designData.append('tags', formData.tags);

      // Add images if any
      formData.images.forEach((image, index) => {
        if (image instanceof File) {
          designData.append('images', image);
        }
      });

      const response = await adminApiService.updateDesign(selectedDesign._id, designData);
      
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Design updated successfully!',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        setShowEditModal(false);
        resetForm();
        loadDesigns();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to update design');
      }
    } catch (err) {
      console.error('Error updating design:', err);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update design. Please try again.',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddDesign = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!formData.name || !formData.category || !formData.garmentType) {
      await Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields (Name, Category, and Garment Type)',
        confirmButtonText: 'OK'
      });
      setLoading(false);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('garmentType', formData.garmentType);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price || 0);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('estimatedTime', formData.estimatedTime || 0);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('requiredMeasurements', JSON.stringify(selectedMeasurements));
      
      // Append image files
      formData.images.forEach((image, index) => {
        if (image instanceof File) {
          formDataToSend.append('images', image);
        }
      });

      const response = await adminApiService.createDesign(formDataToSend);

      if (response.success) {
        // Show success message with SweetAlert
        await Swal.fire({
          icon: 'success',
          title: 'Design Created Successfully!',
          text: `"${formData.name}" has been added to the database.`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        setShowAddModal(false);
        resetForm();
        loadDesigns();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to create design');
      }
    } catch (err) {
      console.error('Error creating design:', err);
      
      // Show error message with SweetAlert
      await Swal.fire({
        icon: 'error',
        title: 'Design Creation Failed!',
        text: err.message || 'Failed to create design. Please try again.',
        confirmButtonText: 'OK'
      });
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          </header>

          {/* Design Management Controls */}
          <div className="bg-white rounded-lg shadow border border-gray-100 mb-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Search designs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="all">All Difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-100">Under ₹100</option>
                    <option value="100-500">₹100 - ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="over-1000">Over ₹1000</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="category">Sort by Category</option>
                    <option value="status">Sort by Status</option>
                    <option value="difficulty">Sort by Difficulty</option>
                    <option value="createdAt">Sort by Date</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                      setStatusFilter("all");
                      setDifficultyFilter("all");
                      setPriceRange("all");
                      setSortBy("name");
                      setSortOrder("asc");
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-all duration-300"
                  >
                    Clear
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-md font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300">
                    Export
                  </button>
                </div>
              </div>
            </div>


            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <FiLoader className="w-8 h-8 text-coralblush animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading designs...</p>
              </div>
            )}

            {/* Designs Table */}
            {!loading && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pl-3 pr-2 text-xs font-medium text-gray-700 w-1/3">Design</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 w-1/6">Category</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 w-1/6">Price</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 w-1/6">Difficulty</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 w-1/6">Status</th>
                        <th className="text-left py-2 pr-3 pl-2 text-xs font-medium text-gray-700 w-1/6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDesigns.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500">
                            No designs found
                          </td>
                        </tr>
                      ) : (
                        getCurrentPageDesigns().map((design, index) => (
                          <tr key={design._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 pl-3 pr-2 w-1/3">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="flex-shrink-0">
                                  {design.images && design.images.length > 0 ? (
                                    <img
                                      className="h-8 w-8 rounded object-cover"
                                      src={design.images[0].url || design.images[0]}
                                      alt={design.name}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                                      <FiImage className="text-gray-400 w-3 h-3" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-charcoal truncate">{design.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{design.description?.substring(0, 30)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-2 w-1/6">
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 truncate block">
                                {design.category}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-700 w-1/6 truncate">₹{design.price || 0}</td>
                            <td className="py-2 px-2 w-1/6">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium truncate block ${
                                design.difficulty === 'beginner' 
                                  ? 'bg-green-100 text-green-800' :
                                design.difficulty === 'intermediate' 
                                  ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                                {design.difficulty || 'intermediate'}
                              </span>
                            </td>
                            <td className="py-2 px-2 w-1/6">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium truncate block ${
                                design.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {design.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-2 pr-3 pl-2 w-1/6">
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => handleEditDesign(design)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                  title="Edit Design"
                                >
                                  <FiEdit className="w-3 h-3 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDesign(design._id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                  title="Delete Design"
                                >
                                  <FiTrash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {getTotalPages() > 1 && (
            <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === getTotalPages()}
                  className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * designsPerPage + 1, filteredDesigns.length)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * designsPerPage, filteredDesigns.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{filteredDesigns.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-coralblush border-coralblush text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === getTotalPages()}
                      className="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

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
                        onChange={(e) => {
                          setFormData({...formData, category: e.target.value, garmentType: ""});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Garment Type *
                      </label>
                      <select
                        required
                        value={formData.garmentType}
                        onChange={(e) => setFormData({...formData, garmentType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        disabled={!formData.category}
                      >
                        <option value="">Select Garment Type</option>
                        {formData.category && GARMENT_OPTIONS[formData.category]?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tag
                      </label>
                      <select
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="">Select Tag</option>
                        {TAG_OPTIONS.map((tag) => (
                          <option key={tag.value} value={tag.value}>
                            {tag.label}
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
                  
                   {/* Image Upload Section */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Design Images *
                     </label>
                     
                     {/* Image Upload Input */}
                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-coralblush transition-colors">
                       <input
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="hidden"
                         id="image-upload"
                       />
                       <label
                         htmlFor="image-upload"
                         className="cursor-pointer flex flex-col items-center"
                       >
                         <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                         <span className="text-sm text-gray-600">
                           Click to upload images or drag and drop
                         </span>
                         <span className="text-xs text-gray-500 mt-1">
                           PNG, JPG, GIF up to 10MB each
                         </span>
                       </label>
                     </div>

                     {/* Display Uploaded Images */}
                     {formData.images.length > 0 && (
                       <div className="mt-4">
                         <p className="text-sm font-medium text-gray-700 mb-2">
                           Uploaded Images ({formData.images.length})
                         </p>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {formData.images.map((image, index) => (
                             <div key={index} className="relative group">
                               <img
                                 src={image instanceof File ? URL.createObjectURL(image) : image}
                                 alt={`Design ${index + 1}`}
                                 className="w-full h-24 object-cover rounded-lg border border-gray-200"
                               />
                               <button
                                 type="button"
                                 onClick={() => removeImage(index)}
                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <FiX className="w-3 h-3" />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
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
                  

                   {/* Required Measurements Selection */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Required Measurements
                     </label>
                     
                     {/* Measurement Filter */}
                     <div className="mb-4">
                       <div className="flex flex-wrap gap-2">
                         <button
                           type="button"
                           onClick={() => setMeasurementFilter("all")}
                           className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                             measurementFilter === "all"
                               ? 'bg-coralblush text-white border-coralblush'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-coralblush'
                           }`}
                         >
                           All
                         </button>
                         <button
                           type="button"
                           onClick={() => setMeasurementFilter("upper_body")}
                           className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                             measurementFilter === "upper_body"
                               ? 'bg-coralblush text-white border-coralblush'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-coralblush'
                           }`}
                         >
                           Upper Body
                         </button>
                         <button
                           type="button"
                           onClick={() => setMeasurementFilter("lower_body")}
                           className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                             measurementFilter === "lower_body"
                               ? 'bg-coralblush text-white border-coralblush'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-coralblush'
                           }`}
                         >
                           Lower Body
                         </button>
                         <button
                           type="button"
                           onClick={() => setMeasurementFilter("full_body")}
                           className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                             measurementFilter === "full_body"
                               ? 'bg-coralblush text-white border-coralblush'
                               : 'bg-white text-gray-700 border-gray-300 hover:border-coralblush'
                           }`}
                         >
                           Full Body
                         </button>
                       </div>
                     </div>

                     {/* Selected Measurements (Displayed Above) */}
                     {selectedMeasurements.length > 0 && (
                       <div className="mb-4 p-4 bg-lilac bg-opacity-10 rounded-lg border border-lilac">
                         <p className="text-sm font-medium text-gray-700 mb-3">
                           Selected Measurements ({selectedMeasurements.length})
                         </p>
                         <div className="flex flex-wrap gap-2">
                           {getSelectedMeasurements().map((measurement) => (
                             <span
                               key={measurement.id}
                               className="inline-flex items-center px-3 py-2 bg-lilac text-white text-sm rounded-lg"
                             >
                               {measurement.label}
                               <button
                                 type="button"
                                 onClick={() => handleMeasurementToggle(measurement.id)}
                                 className="ml-2 hover:text-gray-200"
                               >
                                 <FiX className="w-4 h-4" />
                               </button>
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Available Measurements (Displayed Below) */}
                     <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                       <p className="text-sm font-medium text-gray-700 mb-3">
                         Available Measurements ({getUnselectedMeasurements().length})
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {getUnselectedMeasurements().map((measurement) => (
                           <button
                             key={measurement.id}
                             type="button"
                             onClick={() => handleMeasurementToggle(measurement.id)}
                             className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-lilac hover:bg-lilac hover:bg-opacity-10 transition-all duration-200 text-left"
                           >
                             <div className="font-medium">{measurement.label}</div>
                             <div className="text-xs text-gray-500 capitalize">
                               {measurement.category.replace('_', ' ')}
                             </div>
                           </button>
                         ))}
                       </div>
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

          {/* Edit Design Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
                
                <form onSubmit={handleUpdateDesign} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Design Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, garmentType: "" }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Garment Type *
                      </label>
                      <select
                        required
                        value={formData.garmentType}
                        onChange={(e) => setFormData(prev => ({ ...prev, garmentType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        disabled={!formData.category}
                      >
                        <option value="">Select Garment Type</option>
                        {formData.category && GARMENT_OPTIONS[formData.category]?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tag
                      </label>
                      <select
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="">Select Tag</option>
                        {TAG_OPTIONS.map((tag) => (
                          <option key={tag.value} value={tag.value}>
                            {tag.label}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Time (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  {/* Image Upload Section for Editing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-coralblush transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload new images
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Uploading a new image will replace existing images
                        </span>
                      </label>
                    </div>

                    {/* Display Uploaded Images */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Images ({formData.images.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image instanceof File ? URL.createObjectURL(image) : (image.url || image)}
                                alt={`Design ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="casual, formal, summer"
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
                      {loading ? 'Updating...' : 'Update Design'}
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
