import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiCheckCircle, FiXCircle, FiLogOut, FiArrowLeft, FiBriefcase, FiFileText, FiTrendingUp, FiTruck } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import API_CONFIG, { getApiUrl } from '../../config/api';
import Swal from 'sweetalert2';

const SellerProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const navigate = useNavigate();

  // Fetch latest user data from database
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/sellers/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.seller) {
          // Update localStorage with latest data
          localStorage.setItem('user', JSON.stringify(data.seller));
          setUser(data.seller);
          
          setFormData({
            firstName: data.seller.firstname || '',
            lastName: data.seller.lastname || '',
            email: data.seller.email || '',
            phone: data.seller.phone || '',
            countryCode: data.seller.countryCode || '+91',
            businessName: data.seller.businessName || '',
            businessAddress: data.seller.address || '',
            businessType: data.seller.businessType || '',
            gstNumber: data.seller.gstNumber || '',
            panNumber: data.seller.panNumber || '',
            bankAccount: data.seller.bankAccount || '',
            ifscCode: data.seller.ifscCode || ''
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
      setIsBusinessVerified(!!(currentUser?.businessVerified || currentUser?.isVerified));
      
      if (currentUser) {
        setFormData({
          firstName: currentUser.firstname || '',
          lastName: currentUser.lastname || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          countryCode: currentUser.countryCode || '+91',
          businessName: currentUser.businessName || '',
          businessAddress: currentUser.address || '',
          businessType: currentUser.businessType || '',
          gstNumber: currentUser.gstNumber || '',
          panNumber: currentUser.panNumber || '',
          bankAccount: currentUser.bankAccount || '',
          ifscCode: currentUser.ifscCode || ''
        });
        setIsBusinessVerified(!!(currentUser?.businessVerified || currentUser?.isVerified));
        
        // Fetch latest data from database
        fetchUserData();
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

  const ensureValidToken = async () => {
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

  const handleVerifyClick = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Upload Aadhaar',
        text: 'Select your Aadhaar image or PDF for verification',
        input: 'file',
        inputAttributes: {
          accept: 'image/*,application/pdf'
        },
        showCancelButton: true,
        confirmButtonText: 'Verify',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#16a34a'
      });
      if (!file) return;
      setVerifying(true);
      setVerifyResult(null);

      const token = await ensureValidToken();
      const form = new FormData();
      form.append('file', file);
      const expectedName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      if (expectedName) form.append('expectedName', expectedName);
      const resp = await fetch(getApiUrl('SELLER_SERVICE', '/api/sellers/verify-aadhaar'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
        credentials: 'include'
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) throw new Error(data?.message || 'Verification failed');
      if (data.data?.status === 'verified') {
        setVerifyResult(data.data?.parsed || {});
        setIsBusinessVerified(true);
        await Swal.fire({
          icon: 'success',
          title: 'Verification Successful',
          html: `<div style="text-align:left">Aadhaar: <b>${data.data.parsed.aadhaarNumber || '—'}</b><br/>DOB: <b>${data.data.parsed.dob || '—'}</b><br/>Gender: <b>${data.data.parsed.gender || '—'}</b></div>`
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Verification Unverified',
          text: 'Aadhaar number format, DOB, or gender not detected. Please try a clearer image/PDF.'
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.message || 'Please try again with a clearer image.'
      });
    } finally {
      setVerifying(false);
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
    if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
    if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/sellers/update-profile`, {
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
          userType: 'seller'
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
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="profile" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard/seller')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
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
            {/* File input replaced by SweetAlert file picker */}
            {/* Verification Status */}
            {!user.isEmailVerified && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiXCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">Email Not Verified</h3>
                      <p className="text-yellow-700 text-sm">
                        Please verify your email address to access all seller features.
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

            {/* Business Verification Status - hidden once verified */}
            {!isBusinessVerified && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Business Verification Pending</h3>
                      <p className="text-blue-700 text-sm">
                        Your business documents are under review. This usually takes 2-3 business days.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Under Review
                  </span>
                </div>
              </div>
            )}

            {/* Profile Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'profile', label: 'Profile', icon: FiUser },
                    { key: 'business', label: 'Business', icon: FiBriefcase }
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleVerifyClick}
                          disabled={verifying}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                        >
                          {verifying ? 'Verifying...' : 'Complete Verification'}
                        </button>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </button>
                      </div>
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
                    {verifyResult && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-charcoal mb-2">Verification Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                          <div><span className="text-gray-500">Aadhaar:</span> {verifyResult.aadhaarNumber || '—'}</div>
                          <div><span className="text-gray-500">Name:</span> {verifyResult.name || '—'}</div>
                          <div><span className="text-gray-500">DOB:</span> {verifyResult.dob || '—'}</div>
                          <div><span className="text-gray-500">Gender:</span> {verifyResult.gender || '—'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Business Tab */}
                {activeTab === 'business' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Business'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.businessName ? 'border-red-300' : ''}`}
                        />
                        {errors.businessName && (
                          <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Type
                        </label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <option value="">Select Business Type</option>
                          <option value="Fabric Supplier">Fabric Supplier</option>
                          <option value="Textile Manufacturer">Textile Manufacturer</option>
                          <option value="Wholesale Dealer">Wholesale Dealer</option>
                          <option value="Retail Store">Retail Store</option>
                          <option value="Online Store">Online Store</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <textarea
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.businessAddress ? 'border-red-300' : ''}`}
                        />
                        {errors.businessAddress && (
                          <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.gstNumber ? 'border-red-300' : ''}`}
                        />
                        {errors.gstNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.panNumber ? 'border-red-300' : ''}`}
                        />
                        {errors.panNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
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

export default SellerProfile; 