import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiCheckCircle, FiXCircle, FiLogOut, FiArrowLeft, FiScissors, FiFileText, FiClock, FiStar, FiCamera, FiUpload, FiX, FiLoader, FiSearch } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import API_CONFIG from '../../config/api';
import Swal from 'sweetalert2';

const TailorProfile = () => {
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [localities, setLocalities] = useState([]);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch latest user data from database
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/tailors/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tailor) {
          // Update localStorage with latest data
          localStorage.setItem('user', JSON.stringify(data.tailor));
          setUser(data.tailor);
          
          setFormData({
            firstName: data.tailor.firstname || '',
            lastName: data.tailor.lastname || '',
            email: data.tailor.email || '',
            phone: data.tailor.phone || '',
            countryCode: data.tailor.countryCode || '+91',
            shopName: data.tailor.shopName || '',
            addressLine: data.tailor.addressLine || '',
            landmark: data.tailor.landmark || '',
            locality: data.tailor.locality || '',
            city: data.tailor.city || '',
            district: data.tailor.district || '',
            state: data.tailor.state || '',
            pincode: data.tailor.pincode || '',
            country: data.tailor.country || 'India',
            experience: String(data.tailor.experience || ''),
            speciality: Array.isArray(data.tailor.specialization) 
              ? data.tailor.specialization 
              : (data.tailor.specialization ? [data.tailor.specialization] : []),
            workingHours: data.tailor.workingHours || '',
            about: data.tailor.about || '',
            portfolio: data.tailor.portfolio || [],
            profileImage: data.tailor.profileImage || '',
            shopImage: data.tailor.shopImage || ''
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
          shopName: currentUser.shopName || '',
          addressLine: currentUser.addressLine || '',
          landmark: currentUser.landmark || '',
          locality: currentUser.locality || '',
          city: currentUser.city || '',
          district: currentUser.district || '',
          state: currentUser.state || '',
          pincode: currentUser.pincode || '',
          country: currentUser.country || 'India',
          experience: String(currentUser.experience || ''),
          speciality: Array.isArray(currentUser.specialization) 
            ? currentUser.specialization 
            : (currentUser.specialization ? [currentUser.specialization] : []),
          workingHours: currentUser.workingHours || '',
          about: currentUser.about || '',
          portfolio: currentUser.portfolio || [],
          profileImage: currentUser.profileImage || '',
          shopImage: currentUser.shopImage || ''
        });
        
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

  // Simple form; saving handled by existing Save Changes

  const ensureValidToken = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) return token;
    // fallback: try refresh via backend util if wired, otherwise return token
    return token || '';
  };

  const handleVerifyClick = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Upload Aadhaar',
        text: 'Select your Aadhaar image or PDF for verification',
        input: 'file',
        inputAttributes: { accept: 'image/*,application/pdf' },
        showCancelButton: true,
        confirmButtonText: 'Verify',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#7c3aed'
      });
      if (!file) return;
      setVerifying(true);
      setVerifyResult(null);

      const token = await ensureValidToken();
      const form = new FormData();
      form.append('file', file);
      const firstName = (formData.firstName || '').trim();
      const lastName = (formData.lastName || '').trim();
      const expectedName = `${firstName} ${lastName}`.trim();
      if (expectedName) form.append('expectedName', expectedName);
      if (firstName) form.append('expectedFirstName', firstName);
      if (lastName) form.append('expectedLastName', lastName);
      // Try tailor-service first (3003), then fallback to auth-service (3000)
      let resp = await fetch(`${API_CONFIG.TAILOR_SERVICE}/api/tailors/verify-aadhaar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
        credentials: 'include'
      });
      if (resp.status === 404) {
        resp = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/tailors/verify-aadhaar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form,
          credentials: 'include'
        });
      }
      const data = await resp.json();
      if (!resp.ok || !data?.success) throw new Error(data?.message || 'Verification failed');
      if (data.data?.status === 'verified') {
        setVerifyResult(data.data?.parsed || {});
        // Update local user cache to reflect verified status immediately
        const updatedUser = {
          ...(user || {}),
          isVerified: true,
          aadhaar: {
            ...(user?.aadhaar || {}),
            number: data.data.parsed?.aadhaarNumber || user?.aadhaar?.number || '',
            dob: data.data.parsed?.dob || user?.aadhaar?.dob || '',
            gender: data.data.parsed?.gender || user?.aadhaar?.gender || '',
            status: 'verified'
          }
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        await Swal.fire({
          icon: 'success',
          title: 'Verification Successful',
          html: `<div style="text-align:left">Aadhaar: <b>${data.data.parsed.aadhaarNumber || '—'}</b><br/>DOB: <b>${data.data.parsed.dob || '—'}</b><br/>Gender: <b>${data.data.parsed.gender || '—'}</b></div>`
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Verification Unverified',
          text: 'Name mismatch or missing/invalid details.'
        });
      }
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Verification Failed', text: err.message || 'Try again later.' });
    } finally {
      setVerifying(false);
    }
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
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.shopName?.trim()) newErrors.shopName = 'Shop name is required';
    if (!formData.addressLine?.trim()) newErrors.addressLine = 'Address line is required';
    if (!formData.locality?.trim()) newErrors.locality = 'Locality is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.district?.trim()) newErrors.district = 'District is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.experience?.trim()) newErrors.experience = 'Experience is required';
    
    // Validate speciality array
    const specialities = Array.isArray(formData.speciality) ? formData.speciality : [];
    if (specialities.length === 0) newErrors.speciality = 'At least one speciality is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSaveProfile = async () => {
    if (!validateForm()) {
      console.error('❌ Validation failed:', errors);
      return;
    }
    
    setLoading(true);
    try {
      // Prepare profile data with all fields
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        shopName: formData.shopName,
        addressLine: formData.addressLine,
        landmark: formData.landmark,
        locality: formData.locality,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        experience: Number(formData.experience) || 0,
        speciality: formData.speciality, // Array of specialities
        workingHours: formData.workingHours,
        about: formData.about
      };
      
      console.log('━'.repeat(60));
      console.log('📤 SENDING PROFILE UPDATE');
      console.log('━'.repeat(60));
      console.log('Shop Name:', profileData.shopName);
      console.log('Address Line:', profileData.addressLine);
      console.log('Landmark:', profileData.landmark);
      console.log('Locality:', profileData.locality);
      console.log('City:', profileData.city);
      console.log('District:', profileData.district);
      console.log('State:', profileData.state);
      console.log('Pincode:', profileData.pincode);
      console.log('Country:', profileData.country);
      console.log('━'.repeat(60));
      console.log('Full Data:', JSON.stringify(profileData, null, 2));
      
      const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/tailors/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(profileData)
      });
      
      console.log('📥 Response Status:', response.status, response.statusText);
      
      const data = await response.json();
      
      console.log('━'.repeat(60));
      console.log('📥 BACKEND RESPONSE');
      console.log('━'.repeat(60));
      console.log('Success:', data.success);
      console.log('Message:', data.message);
      if (data.tailor) {
        console.log('Returned Address Line:', data.tailor.addressLine);
        console.log('Returned Locality:', data.tailor.locality);
        console.log('Returned City:', data.tailor.city);
        console.log('Returned State:', data.tailor.state);
        console.log('Returned Pincode:', data.tailor.pincode);
        console.log('Old address field:', data.tailor.address);
      }
      console.log('━'.repeat(60));
      
      if (data.success && data.tailor) {
        // Update user object with the response from backend
        const updatedUser = {
          ...user,
          firstname: data.tailor.firstname,
          lastname: data.tailor.lastname,
          email: data.tailor.email,
          phone: data.tailor.phone,
          countryCode: data.tailor.countryCode,
          shopName: data.tailor.shopName,
          addressLine: data.tailor.addressLine,
          landmark: data.tailor.landmark,
          locality: data.tailor.locality,
          city: data.tailor.city,
          district: data.tailor.district,
          state: data.tailor.state,
          pincode: data.tailor.pincode,
          country: data.tailor.country,
          experience: data.tailor.experience,
          specialization: data.tailor.specialization,
          workingHours: data.tailor.workingHours,
          about: data.tailor.about,
          profileImage: data.tailor.profileImage || user.profileImage,
          shopImage: data.tailor.shopImage || user.shopImage
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Update form data with backend response
        setFormData({
          firstName: data.tailor.firstname || '',
          lastName: data.tailor.lastname || '',
          email: data.tailor.email || '',
          phone: data.tailor.phone || '',
          countryCode: data.tailor.countryCode || '+91',
          shopName: data.tailor.shopName || '',
          addressLine: data.tailor.addressLine || '',
          landmark: data.tailor.landmark || '',
          locality: data.tailor.locality || '',
          city: data.tailor.city || '',
          district: data.tailor.district || '',
          state: data.tailor.state || '',
          pincode: data.tailor.pincode || '',
          country: data.tailor.country || 'India',
          experience: String(data.tailor.experience || ''),
          speciality: Array.isArray(data.tailor.specialization) 
            ? data.tailor.specialization 
            : (data.tailor.specialization ? [data.tailor.specialization] : []),
          workingHours: data.tailor.workingHours || '',
          about: data.tailor.about || '',
          portfolio: data.tailor.portfolio || [],
          profileImage: data.tailor.profileImage || '',
          shopImage: data.tailor.shopImage || ''
        });
        
        setIsEditing(false);
        
        // Use SweetAlert for better UX
        await Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          text: 'Your profile has been updated successfully.',
          confirmButtonColor: '#7c3aed'
        });
        
        console.log('Profile updated successfully:', data.tailor);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Failed to update profile. Please try again.',
          confirmButtonColor: '#7c3aed'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update profile. Please check your connection and try again.',
        confirmButtonColor: '#7c3aed'
      });
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
          userType: 'tailor'
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

  const handleImageUpload = async (file, imageType) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // Upload to tailor service
      const uploadResponse = await fetch(`${API_CONFIG.TAILOR_SERVICE}/api/tailors/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      
      if (uploadData.success) {
        const imageUrl = uploadData.data[imageType];
        
        // Update the form data with the new image URL
        setFormData(prev => ({
          ...prev,
          [imageType]: imageUrl
        }));
        
        // Update the user object immediately for UI feedback
        const updatedUser = { ...user, [imageType]: imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        alert(`${imageType === 'profileImage' ? 'Profile' : 'Shop'} image updated successfully!`);
      } else {
        throw new Error(uploadData.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileSelect = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      handleImageUpload(file, imageType);
    }
  };

  const availableSpecialities = [
    'Formal Wear',
    'Casual Wear',
    'Bridal Wear',
    'Western Wear',
    'Traditional Wear'
  ];

  const handleSpecialityChange = (speciality) => {
    const currentSpecialities = Array.isArray(formData.speciality) 
      ? formData.speciality 
      : (formData.speciality ? [formData.speciality] : []);
    
    const updatedSpecialities = currentSpecialities.includes(speciality)
      ? currentSpecialities.filter(s => s !== speciality)
      : [...currentSpecialities, speciality];
    
    setFormData(prev => ({
      ...prev,
      speciality: updatedSpecialities
    }));

    // Clear error if user has selected at least one speciality
    if (updatedSpecialities.length > 0 && errors.speciality) {
      setErrors(prev => ({
        ...prev,
        speciality: ''
      }));
    }
  };

  // Function to fetch address details from pincode
  const fetchAddressFromPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setPincodeLoading(true);
    setPincodeError('');

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pincode data');
      }

      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        
        // Extract unique localities from post offices
        const uniqueLocalities = [...new Set(postOffices.map(po => po.Name).filter(Boolean))];
        setLocalities(uniqueLocalities);
        
        // If only one locality, auto-select it
        if (uniqueLocalities.length === 1) {
          setFormData(prev => ({
            ...prev,
            locality: uniqueLocalities[0],
            city: postOffices[0].Division || postOffices[0].Block || '',
            district: postOffices[0].District || '',
            state: postOffices[0].State || '',
            country: 'India'
          }));
          setShowLocalityDropdown(false);
        } else if (uniqueLocalities.length > 1) {
          // If multiple localities, show dropdown
          setFormData(prev => ({
            ...prev,
            locality: '',
            city: postOffices[0].Division || postOffices[0].Block || '',
            district: postOffices[0].District || '',
            state: postOffices[0].State || '',
            country: 'India'
          }));
          setShowLocalityDropdown(true);
        }
        
        setPincodeError('');
      } else {
        setPincodeError('Pincode not found. Please check and try again.');
        // Clear the fields if pincode is invalid
        setFormData(prev => ({
          ...prev,
          locality: '',
          city: '',
          district: '',
          state: ''
        }));
        setLocalities([]);
        setShowLocalityDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      setPincodeError('Failed to fetch address details. Please try again.');
      // Clear the fields on error
      setFormData(prev => ({
        ...prev,
        locality: '',
        city: '',
        district: '',
        state: ''
      }));
      setLocalities([]);
      setShowLocalityDropdown(false);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Handle pincode input with debouncing
  const handlePincodeChange = (e) => {
    const { value } = e.target;
    
    // Update the pincode field
    setFormData(prev => ({
      ...prev,
      pincode: value
    }));

    // Clear error when user starts typing
    setPincodeError('');

    // Fetch address details when pincode is 6 digits
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      fetchAddressFromPincode(value);
    } else if (value.length < 6) {
      // Clear fields if pincode is incomplete
      setFormData(prev => ({
        ...prev,
        locality: '',
        city: '',
        district: '',
        state: ''
      }));
      setLocalities([]);
      setShowLocalityDropdown(false);
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
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-600 transition-all duration-200"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
                  onClick={() => navigate('/dashboard/tailor')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Tailor Profile</h1>
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
                        Please verify your email address to access all tailor features.
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

            {/* Identity Verification */}
            {user.isVerified ? (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Aadhaar Verified</h3>
                      <p className="text-green-700 text-sm">
                        Your identity has been verified successfully.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiFileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Identity Verification Pending</h3>
                      <p className="text-blue-700 text-sm">
                        Verify your identity with Aadhaar to get verified status.
                      </p>
                    </div>
                  </div>
                  <button onClick={handleVerifyClick} disabled={verifying} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                    {verifying ? 'Verifying...' : 'Verify with Aadhaar'}
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
                    { key: 'shop', label: 'Shop', icon: FiScissors }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === tab.key
                            ? 'border-purple-500 text-purple-600'
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
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                      </button>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          {formData.profileImage ? (
                            <img
                              src={formData.profileImage}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                              <FiUser className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {isEditing && (
                            <label className="absolute -bottom-2 -right-2 bg-purple-500 text-white rounded-full p-2 cursor-pointer hover:bg-purple-600 transition-all duration-200">
                              <FiCamera className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileSelect(e, 'profileImage')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">
                            Upload a professional profile photo to help customers recognize you.
                          </p>
                          {isEditing && (
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200">
                                <FiUpload className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {uploadingImage ? 'Uploading...' : 'Choose Photo'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileSelect(e, 'profileImage')}
                                  className="hidden"
                                  disabled={uploadingImage}
                                />
                              </label>
                              {formData.profileImage && (
                                <button
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, profileImage: '' }));
                                    const updatedUser = { ...user, profileImage: '' };
                                    setUser(updatedUser);
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
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
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
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
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
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
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
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
                          focusColor="purple"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          About Me
                        </label>
                        <textarea
                          name="about"
                          value={formData.about}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Tell customers about your experience, expertise, and what makes you unique..."
                        />
                      </div>

                      {/* Display Selected Specialities */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          My Specialities
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(formData.speciality) ? formData.speciality : []).length > 0 ? (
                            (Array.isArray(formData.speciality) ? formData.speciality : []).map((spec) => (
                              <span
                                key={spec}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                              >
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">No specialities selected</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar Details (if available) */}
                    {(verifyResult?.aadhaarNumber || user?.aadhaar?.number) && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-md font-semibold text-gray-900 mb-2">Aadhaar Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="text-gray-500">Aadhaar:</span> {verifyResult?.aadhaarNumber || user?.aadhaar?.number || '—'}</div>
                          <div><span className="text-gray-500">DOB:</span> {verifyResult?.dob || user?.aadhaar?.dob || '—'}</div>
                          <div><span className="text-gray-500">Gender:</span> {verifyResult?.gender || user?.aadhaar?.gender || '—'}</div>
                        </div>
                      </div>
                    )}

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
                          className="px-6 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Shop Tab */}
                {activeTab === 'shop' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Shop Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit Shop'}</span>
                      </button>
                    </div>

                    {/* Shop Image Upload */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Photo</h3>
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          {formData.shopImage ? (
                            <img
                              src={formData.shopImage}
                              alt="Shop"
                              className="w-32 h-24 rounded-lg object-cover border-4 border-white shadow-lg"
                            />
                          ) : (
                            <div className="w-32 h-24 rounded-lg bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                              <FiScissors className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {isEditing && (
                            <label className="absolute -bottom-2 -right-2 bg-purple-500 text-white rounded-full p-2 cursor-pointer hover:bg-purple-600 transition-all duration-200">
                              <FiCamera className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileSelect(e, 'shopImage')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">
                            Upload a photo of your shop or workspace to showcase your professional environment.
                          </p>
                          {isEditing && (
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200">
                                <FiUpload className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {uploadingImage ? 'Uploading...' : 'Choose Shop Photo'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileSelect(e, 'shopImage')}
                                  className="hidden"
                                  disabled={uploadingImage}
                                />
                              </label>
                              {formData.shopImage && (
                                <button
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, shopImage: '' }));
                                    const updatedUser = { ...user, shopImage: '' };
                                    setUser(updatedUser);
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display Mode - Show saved data in nice format */}
                    {!isEditing && (
                      <div className="space-y-6">
                        {/* Shop Details Display */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <FiScissors className="w-5 h-5 mr-2 text-purple-500" />
                            Shop Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                              <p className="text-sm font-medium text-gray-900">{formData.shopName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Experience</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formData.experience ? `${formData.experience} ${formData.experience === '1' ? 'Year' : 'Years'}` : '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Specialities Display */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <FiStar className="w-5 h-5 mr-2 text-purple-500" />
                            Specialities
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(formData.speciality) ? formData.speciality : []).length > 0 ? (
                              (Array.isArray(formData.speciality) ? formData.speciality : []).map((spec) => (
                                <span
                                  key={spec}
                                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                                >
                                  {spec}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No specialities selected</span>
                            )}
                          </div>
                        </div>

                        {/* Complete Address Display */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <FiMapPin className="w-5 h-5 mr-2 text-purple-500" />
                            Shop Address
                          </h3>
                          
                          {formData.addressLine || formData.locality || formData.city ? (
                            <div className="space-y-3">
                              {/* Formatted Address */}
                              <div className="text-sm text-gray-900">
                                {formData.addressLine && (
                                  <p className="font-medium">{formData.addressLine}</p>
                                )}
                                {formData.landmark && (
                                  <p className="text-gray-600">Landmark: {formData.landmark}</p>
                                )}
                                {formData.locality && (
                                  <p className="mt-1">{formData.locality}</p>
                                )}
                                {(formData.city || formData.district || formData.state || formData.pincode) && (
                                  <p className="mt-1">
                                    {[formData.city, formData.district, formData.state, formData.pincode]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                )}
                                {formData.country && formData.country !== 'India' && (
                                  <p className="mt-1">{formData.country}</p>
                                )}
                              </div>

                              {/* Detailed View */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500">City</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.city || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">District</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.district || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">State</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.state || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Pincode</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.pincode || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Locality</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.locality || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Country</p>
                                  <p className="text-sm font-medium text-gray-900">{formData.country || 'India'}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">No address information available. Click "Edit Shop" to add your shop address.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Edit Mode - Show input fields */}
                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shop Name
                          </label>
                          <input
                            type="text"
                            name="shopName"
                            value={formData.shopName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 border-gray-300 ${errors.shopName ? 'border-red-300' : ''}`}
                          />
                          {errors.shopName && (
                            <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 border-gray-300 ${errors.experience ? 'border-red-300' : ''}`}
                          />
                          {errors.experience && (
                            <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                          )}
                        </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Specialities
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {availableSpecialities.map((speciality) => (
                            <label
                              key={speciality}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                (Array.isArray(formData.speciality) ? formData.speciality : []).includes(speciality)
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={(Array.isArray(formData.speciality) ? formData.speciality : []).includes(speciality)}
                                onChange={() => handleSpecialityChange(speciality)}
                                disabled={!isEditing}
                                className="mr-3 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium">{speciality}</span>
                            </label>
                          ))}
                        </div>
                        {errors.speciality && (
                          <p className="text-red-500 text-xs mt-2">{errors.speciality}</p>
                        )}
                      </div>

                      {/* Pincode Field - First to trigger auto-fill */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Enter a 6-digit pincode to automatically fetch city, district, and state details
                        </p>
                        <div className="relative">
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                          disabled={!isEditing}
                            placeholder="6-digit pincode"
                            pattern="[0-9]{6}"
                            maxLength="6"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              isEditing ? (pincodeError ? 'border-red-300' : 'border-gray-300') : 'border-gray-200 bg-gray-50'
                            } ${errors.pincode ? 'border-red-300' : ''}`}
                          />
                          {pincodeLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FiLoader className="w-4 h-4 text-purple-500 animate-spin" />
                            </div>
                          )}
                          {formData.pincode.length === 6 && !pincodeLoading && !pincodeError && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FiSearch className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        {pincodeError && (
                          <p className="text-red-500 text-xs mt-1">{pincodeError}</p>
                        )}
                        {formData.pincode.length === 6 && !pincodeLoading && !pincodeError && (
                          <p className="text-green-500 text-xs mt-1">✓ Address details fetched successfully</p>
                        )}
                        {errors.pincode && (
                          <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                        )}
                      </div>

                      {/* Address Line */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line
                        </label>
                        <input
                          type="text"
                          name="addressLine"
                          value={formData.addressLine}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="House/Shop number, Street name"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          } ${errors.addressLine ? 'border-red-300' : ''}`}
                        />
                        {errors.addressLine && (
                          <p className="text-red-500 text-xs mt-1">{errors.addressLine}</p>
                        )}
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Near hospital, school, etc."
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                    </div>
 
                      {/* Locality */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Locality
                        </label>
                        {showLocalityDropdown && localities.length > 1 ? (
                          <select
                            name="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                            } ${errors.locality ? 'border-red-300' : ''}`}
                          >
                            <option value="">Select Locality</option>
                            {localities.map(locality => (
                              <option key={locality} value={locality}>{locality}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter locality name"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              isEditing ? (formData.pincode.length === 6 && !pincodeError && formData.locality ? 'bg-green-50 border-green-300' : 'border-gray-300') : 'border-gray-200 bg-gray-50'
                            } ${errors.locality ? 'border-red-300' : ''}`}
                          />
                        )}
                        {formData.pincode.length === 6 && !pincodeError && formData.locality && (
                          <p className="text-green-500 text-xs mt-1">
                            {showLocalityDropdown && localities.length > 1 ? 'Please select from available localities' : 'Auto-filled from pincode'}
                          </p>
                        )}
                        {errors.locality && (
                          <p className="text-red-500 text-xs mt-1">{errors.locality}</p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter city name"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? (formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300') : 'border-gray-200 bg-gray-50'
                          } ${errors.city ? 'border-red-300' : ''}`}
                        />
                        {formData.pincode.length === 6 && !pincodeError && formData.city && (
                          <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                        )}
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                    </div>

                      {/* District */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District
                        </label>
                          <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                            disabled={!isEditing}
                          placeholder="Enter district name"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? (formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300') : 'border-gray-200 bg-gray-50'
                          } ${errors.district ? 'border-red-300' : ''}`}
                        />
                        {formData.pincode.length === 6 && !pincodeError && formData.district && (
                          <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                        )}
                        {errors.district && (
                          <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                            isEditing ? (formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300') : 'border-gray-200 bg-gray-50'
                          } ${errors.state ? 'border-red-300' : ''}`}
                        >
                          <option value="">Select State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                        {formData.pincode.length === 6 && !pincodeError && formData.state && (
                          <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                        )}
                        {errors.state && (
                          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                        )}
                      </div>

                        {/* Save/Cancel Buttons for Edit Mode */}
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all duration-200 disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
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

export default TailorProfile; 