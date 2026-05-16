import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AddressManagement from "../../components/customer/AddressManagement";
import { getApiUrl } from "../../config/api";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiStar, 
  FiMapPin, 
  FiHome,
  FiBriefcase,
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiNavigation
} from "react-icons/fi";

const CustomerAddresses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  // Load addresses from customer-service
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const url = getApiUrl('CUSTOMER_SERVICE', '/api/addresses');
        const response = await axios.get(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });

        const apiData = Array.isArray(response?.data?.data) ? response.data.data : [];
        const mapped = apiData.map(item => ({
          id: item._id,
          addressType: item.addressType,
          addressLine: item.addressLine || '',
          landmark: item.landmark || '',
          locality: item.locality || '',
          city: item.city || '',
          district: item.district || '',
          state: item.state || '',
          pincode: item.pincode || '',
          country: item.country || 'India',
          isDefault: !!item.isDefault,
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
          coordinates: item.coordinates,
        }));

        setAddresses(mapped);
      } catch (err) {
        console.error('Error loading addresses:', err);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const url = getApiUrl('CUSTOMER_SERVICE', `/api/addresses/${id}`);
        await axios.delete(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });
        setAddresses(addresses.filter(a => a.id !== id));
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // API call to set default address
      setAddresses(addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      })));
      // Show success message
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const handleFormSubmit = async (addressData) => {
    try {
      if (editingAddress) {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const url = getApiUrl('CUSTOMER_SERVICE', `/api/addresses/${editingAddress.id}`);
        const { data } = await axios.put(url, addressData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const updated = data?.data;
        const updatedAddresses = addresses.map(a => 
          a.id === editingAddress.id 
            ? {
                ...a,
                addressType: updated?.addressType ?? addressData.addressType ?? a.addressType,
                addressLine: updated?.addressLine ?? addressData.addressLine ?? a.addressLine,
                landmark: updated?.landmark ?? addressData.landmark ?? a.landmark,
                locality: updated?.locality ?? addressData.locality ?? a.locality,
                city: updated?.city ?? addressData.city ?? a.city,
                district: updated?.district ?? addressData.district ?? a.district,
                state: updated?.state ?? addressData.state ?? a.state,
                pincode: updated?.pincode ?? addressData.pincode ?? a.pincode,
                country: updated?.country ?? addressData.country ?? a.country,
                isDefault: updated?.isDefault ?? addressData.isDefault ?? a.isDefault,
              }
            : a
        );
        setAddresses(updatedAddresses);
      } else {
        // Create new address in backend
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const url = getApiUrl('CUSTOMER_SERVICE', '/api/addresses');
        const { data } = await axios.post(url, addressData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        const created = data?.data;
        const mappedNew = {
          id: created?._id,
          addressType: created?.addressType ?? addressData.addressType,
          addressLine: created?.addressLine ?? addressData.addressLine ?? '',
          landmark: created?.landmark ?? addressData.landmark ?? '',
          locality: created?.locality ?? addressData.locality ?? '',
          city: created?.city ?? addressData.city ?? '',
          district: created?.district ?? addressData.district ?? '',
          state: created?.state ?? addressData.state ?? '',
          pincode: created?.pincode ?? addressData.pincode ?? '',
          country: created?.country ?? addressData.country ?? 'India',
          isDefault: created?.isDefault ?? !!addressData.isDefault,
          createdAt: created?.createdAt ? new Date(created.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          coordinates: created?.coordinates,
        };
        setAddresses([...addresses, mappedNew]);
      }
      setShowForm(false);
      setEditingAddress(null);
      // Show success message
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = address.addressLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         address.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         address.pincode.includes(searchQuery);
    const matchesFilter = filterType === "all" || address.addressType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home": return "🏠";
      case "office": return "🏢";
      case "other": return "📍";
      default: return "📍";
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case "home": return "bg-blue-100 text-blue-700";
      case "office": return "bg-green-100 text-green-700";
      case "other": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="addresses" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="addresses" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                <p className="text-gray-600 mt-1">Manage your delivery and billing addresses</p>
              </div>
              
              <button
                onClick={handleAddAddress}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Address
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search addresses..."
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
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Addresses</p>
                    <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
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
                      {addresses.filter(a => a.isDefault).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiHome className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Home Addresses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {addresses.filter(a => a.addressType === "home").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <FiBriefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Office Addresses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {addresses.filter(a => a.addressType === "office").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Grid/List */}
            {filteredAddresses.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredAddresses.map((address) => (
                  <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getAddressTypeIcon(address.addressType)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg capitalize">
                              {address.addressType} Address
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiMapPin className="w-4 h-4" />
                              <span>{address.city}, {address.state}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Default
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAddressTypeColor(address.addressType)}`}>
                            {address.addressType}
                          </span>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Address Line</p>
                          <p className="font-medium text-gray-900">{address.addressLine}</p>
                        </div>
                        
                        {address.landmark && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Landmark</p>
                            <p className="font-medium text-gray-900">{address.landmark}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">City</p>
                            <p className="font-medium text-gray-900">{address.city}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">District</p>
                            <p className="font-medium text-gray-900">{address.district}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">State</p>
                            <p className="font-medium text-gray-900">{address.state}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Pincode</p>
                            <p className="font-medium text-gray-900">{address.pincode}</p>
                          </div>
                        </div>

                        {address.coordinates && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FiNavigation className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-600">Location coordinates available</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600">
                          <p>Added: {address.createdAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FiEdit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                          >
                            <FiStar className="w-4 h-4 mr-2" />
                            Set Default
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
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
                  <FiMapPin className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first address"
                  }
                </p>
                {!searchQuery && filterType === "all" && (
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
                  >
                    <FiPlus className="w-4 h-4 mr-2 inline" />
                    Add First Address
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
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
              <AddressManagement
                address={editingAddress}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses; 