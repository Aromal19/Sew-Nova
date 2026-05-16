import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiCheckCircle, FiXCircle, FiLogOut, FiArrowLeft, FiShoppingBag, FiHeart, FiStar, FiPackage, FiUserCheck } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import API_CONFIG, { getApiUrl } from '../../config/api';

const CustomerProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const navigate = useNavigate();

  // Fetch default address from customer service
  const fetchDefaultAddress = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) return;

      const url = getApiUrl('CUSTOMER_SERVICE', '/api/addresses/default');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDefaultAddress(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching default address:', error);
    }
  };

  // Fetch latest user data from database
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/customers/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.customer) {
          // Update localStorage with latest data
          localStorage.setItem('user', JSON.stringify(data.customer));
          setUser(data.customer);
          
          setFormData({
            firstName: data.customer.firstname || '',
            lastName: data.customer.lastname || '',
            email: data.customer.email || '',
            phone: data.customer.phone || '',
            countryCode: data.customer.countryCode || '+91',
            gender: data.customer.gender || '',
            preferences: data.customer.preferences || [],
            measurements: data.customer.measurements || {}
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      
      setIsLoggedIn(authenticated);
      setUser(currentUser);
      
      if (currentUser) {
        setFormData({
          firstName: currentUser.firstname || '',
          lastName: currentUser.lastname || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          countryCode: currentUser.countryCode || '+91',
          gender: currentUser.gender || '',
          preferences: currentUser.preferences || [],
          measurements: currentUser.measurements || {}
        });
        
        // Fetch latest data from database and default address
        fetchUserData();
        fetchDefaultAddress();
      } else {
        setUserLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCountryCodeChange = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      countryCode: countryCode
    }));
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/customers/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const resendVerificationEmail = async () => {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          userType: 'customer'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Verification email sent successfully!');
        // Refresh user data to get latest verification status
        await fetchUserData();
      } else {
        alert(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-600 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading profile...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="profile" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/customer/landing')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Verification Status */}
            {!user.isEmailVerified && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiXCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">Email Not Verified</h3>
                      <p className="text-yellow-700 text-sm">
                        Please verify your email address to access all customer features.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resendVerificationEmail}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all duration-200"
                  >
                    Resend Email
                  </button>
                </div>
              </div>
            )}

            {/* Profile Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'profile', label: 'Profile', icon: FiUser },
                    { key: 'preferences', label: 'Preferences', icon: FiHeart }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === tab.key
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.firstName ? 'border-red-300' : ''}`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.lastName ? 'border-red-300' : ''}`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing || user.isEmailVerified}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                              isEditing && !user.isEmailVerified ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                            } ${errors.email ? 'border-red-300' : ''}`}
                          />
                          {user.isEmailVerified ? (
                            <FiCheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <FiXCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        {user.isEmailVerified && (
                          <p className="text-green-600 text-xs mt-1">Email verified - cannot be changed</p>
                        )}
                        {!user.isEmailVerified && (
                          <p className="text-red-500 text-xs mt-1">Email not verified</p>
                        )}
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <PhoneNumberInput
                          value={formData.phone}
                          onChange={handleInputChange}
                          onCountryCodeChange={handleCountryCodeChange}
                          disabled={!isEditing}
                          error={errors.phone}
                          placeholder="Enter phone number"
                          focusColor="emerald"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.gender ? 'border-red-300' : ''}`}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                        )}
                      </div>

                      {/* Default Address Display */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Address
                        </label>
                        {defaultAddress ? (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">
                                  {defaultAddress.addressLine}
                                  {defaultAddress.landmark && (
                                    <span className="text-gray-600">, {defaultAddress.landmark}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {defaultAddress.locality && `${defaultAddress.locality}, `}
                                  {defaultAddress.city && `${defaultAddress.city}, `}
                                  {defaultAddress.state && `${defaultAddress.state} - `}
                                  {defaultAddress.pincode}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {defaultAddress.addressType.charAt(0).toUpperCase() + defaultAddress.addressType.slice(1)} Address
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FiXCircle className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm text-yellow-800">No default address set</span>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">
                              Please add a default address in the Addresses section
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Shopping Preferences</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Preferences'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Fabric Preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Rayon', 'Denim', 'Velvet'].map((fabric) => (
                            <label key={fabric} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.preferences?.includes(fabric) || false}
                                onChange={(e) => {
                                  const newPreferences = e.target.checked
                                    ? [...(formData.preferences || []), fabric]
                                    : (formData.preferences || []).filter(p => p !== fabric);
                                  setFormData(prev => ({ ...prev, preferences: newPreferences }));
                                }}
                                disabled={!isEditing}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700">{fabric}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Style Preferences
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['Traditional', 'Western', 'Casual', 'Formal', 'Ethnic', 'Contemporary', 'Vintage', 'Modern'].map((style) => (
                            <label key={style} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.preferences?.includes(style) || false}
                                onChange={(e) => {
                                  const newPreferences = e.target.checked
                                    ? [...(formData.preferences || []), style]
                                    : (formData.preferences || []).filter(p => p !== style);
                                  setFormData(prev => ({ ...prev, preferences: newPreferences }));
                                }}
                                disabled={!isEditing}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700">{style}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerProfile; 