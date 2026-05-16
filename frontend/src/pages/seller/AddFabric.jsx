import React, { useState } from "react";
import API_CONFIG, { getApiUrl } from "../../config/api";
import Sidebar from "../../components/Sidebar";
import { 
  FiUpload, 
  FiX, 
  FiSave, 
  FiPlus, 
  FiTrendingUp, 
  FiTag, 
  FiBox,
  FiImage,
  FiFileText,
  FiAlertCircle
} from "react-icons/fi";

const AddFabric = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    pattern: "",
    weight: "",
    width: "",
    price: "",
    pricePerUnit: "per_meter",
    stock: "",
    careInstructions: "",
    description: "",
    tags: [],
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");

  const categories = [
    { value: "cotton", label: "Cotton" },
    { value: "silk", label: "Silk" },
    { value: "linen", label: "Linen" },
    { value: "wool", label: "Wool" },
    { value: "polyester", label: "Polyester" },
    { value: "denim", label: "Denim" },
    { value: "chiffon", label: "Chiffon" },
    { value: "georgette", label: "Georgette" },
    { value: "other", label: "Other" }
  ];

  const priceUnits = [
    { value: "per_meter", label: "Per Meter" },
    { value: "per_yard", label: "Per Yard" },
    { value: "per_piece", label: "Per Piece" }
  ];

  const patterns = [
    { value: "solid", label: "Solid" },
    { value: "floral", label: "Floral" },
    { value: "geometric", label: "Geometric" },
    { value: "striped", label: "Striped" },
    { value: "polka_dot", label: "Polka Dot" },
    { value: "abstract", label: "Abstract" },
    { value: "other", label: "Other" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + formData.images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Auto-detect color from the first newly added image
    if (imageFiles.length > 0) {
      void (async () => {
        try {
          // Ensure valid token (reuse logic from submit)
          const isTokenNearExpiry = (jwtToken) => {
            try {
              if (!jwtToken) return true;
              const parts = jwtToken.split('.');
              if (parts.length !== 3) return true;
              const payload = JSON.parse(atob(parts[1]));
              const now = Math.floor(Date.now() / 1000);
              const safetyWindowSeconds = 30;
              return typeof payload.exp !== 'number' || payload.exp <= (now + safetyWindowSeconds);
            } catch {
              return true;
            }
          };
          const ensureValidToken = async () => {
            let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (!token || isTokenNearExpiry(token)) {
              try {
                const refreshResponse = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/refresh-token`, { method: 'POST', credentials: 'include' });
                const refreshData = await refreshResponse.json();
                if (refreshData?.success && refreshData?.accessToken) {
                  localStorage.setItem('accessToken', refreshData.accessToken);
                  localStorage.setItem('token', refreshData.accessToken);
                  token = refreshData.accessToken;
                }
              } catch {}
            }
            return token || '';
          };

          const token = await ensureValidToken();
          const form = new FormData();
          form.append('image', imageFiles[0]);
          const resp = await fetch(getApiUrl('SELLER_SERVICE', '/api/products/detect-color'), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form,
            credentials: 'include'
          });
          const data = await resp.json();
          if (resp.ok && data?.success && data?.color) {
            setFormData(prev => ({ ...prev, color: data.color }));
          }
        } catch {}
      })();
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Fabric name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.pricePerUnit) newErrors.pricePerUnit = "Price unit is required";
    if (!formData.color.trim()) newErrors.color = "Color is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.stock) newErrors.stock = "Stock quantity is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.careInstructions.trim()) newErrors.careInstructions = "Care instructions are required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const isTokenNearExpiry = (jwtToken) => {
        try {
          if (!jwtToken) return true;
          const parts = jwtToken.split('.');
          if (parts.length !== 3) return true;
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          const safetyWindowSeconds = 30;
          return typeof payload.exp !== 'number' || payload.exp <= (now + safetyWindowSeconds);
        } catch {
          return true;
        }
      };

      const ensureValidToken = async () => {
        let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token || isTokenNearExpiry(token)) {
          try {
            const refreshResponse = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/refresh-token`, {
              method: 'POST',
              credentials: 'include'
            });
            const refreshData = await refreshResponse.json();
            if (refreshData?.success && refreshData?.accessToken) {
              localStorage.setItem('accessToken', refreshData.accessToken);
              localStorage.setItem('token', refreshData.accessToken);
              token = refreshData.accessToken;
            }
          } catch {}
        }
        return token || '';
      };

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("category", (formData.category || '').toLowerCase());
      form.append("price", String(formData.price));
      form.append("pricePerUnit", formData.pricePerUnit);
      form.append("color", formData.color);
      if (formData.pattern) form.append("pattern", (formData.pattern || '').toLowerCase().replace(/\s+/g, '_'));
      form.append("weight", String(formData.weight));
      form.append("width", String(formData.width));
      form.append("careInstructions", formData.careInstructions);
      form.append("stock", String(formData.stock));
      if (formData.tags?.length) form.append("tags", formData.tags.join(","));
      for (const img of formData.images) {
        form.append("images", img.file);
      }

      const token = await ensureValidToken();
      const doRequest = async (useToken) => {
        const resp = await fetch(getApiUrl('SELLER_SERVICE', '/api/products'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${useToken}`
          },
          body: form,
          credentials: 'include'
        });
        return resp;
      };
      let response = await doRequest(token);
      if (response.status === 401) {
        const refreshed = await ensureValidToken();
        response = await doRequest(refreshed);
      }
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Request failed: ${response.status}`);
      }

      alert("Fabric added successfully!");
    } catch (error) {
      console.error('Add fabric failed:', error);
      alert(error.message || "Error adding fabric. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole="seller" 
      />
      
      <main className={`flex-1 transition-all duration-500 ease-in-out ${
        sidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
        <div className="p-6">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-charcoal">Add New Fabric</h1>
                <p className="text-gray-600 mt-2">Add a new fabric to your inventory with detailed information.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300">
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-semibold hover:from-pink-500 hover:to-coralblush transition-all duration-300 shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{isSubmitting ? "Saving..." : "Save Fabric"}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-charcoal">Fabric Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fabric Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Premium Silk Fabric"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Unit *
                      </label>
                      <select
                        name="pricePerUnit"
                        value={formData.pricePerUnit}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                          errors.pricePerUnit ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {priceUnits.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {errors.pricePerUnit && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {errors.pricePerUnit}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color *
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                          errors.color ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Navy Blue"
                      />
                      {errors.color && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {errors.color}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pattern
                      </label>
                      <select
                        name="pattern"
                        value={formData.pattern}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      >
                        <option value="">Select Pattern</option>
                        {patterns.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (g/m²)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        placeholder="e.g., 120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        placeholder="e.g., 140"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <div className="relative">
                        <FiTrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                          errors.stock ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {errors.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images and Description */}
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images * (Max 5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-coralblush transition-colors">
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PNG, JPG, GIF up to 10MB each
                      </p>
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
                        className="px-4 py-2 bg-coralblush text-white rounded-lg cursor-pointer hover:bg-pink-500 transition-colors"
                      >
                        Choose Files
                      </label>
                    </div>
                    {errors.images && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {errors.images}
                      </p>
                    )}

                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Care Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Care Instructions *
                    </label>
                    <input
                      type="text"
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                        errors.careInstructions ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Hand wash cold, do not bleach"
                    />
                    {errors.careInstructions && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {errors.careInstructions}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe the fabric, its features, and usage..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-coralblush text-white rounded-lg hover:bg-pink-500 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddFabric; 