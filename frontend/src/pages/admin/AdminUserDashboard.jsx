import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCamera, 
  FiSave, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiUpload,
  FiEdit3,
  FiShield,
  FiSettings
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated, logout } from "../../utils/api";
import { adminApiService } from "../../services/adminApiService";

const AdminSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: null,
    role: 'admin'
  });
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      loadAdminProfile();
    }
  }, [navigate]);

  const loadAdminProfile = async () => {
    setLoading(true);
    try {
      const response = await adminApiService.getAdminProfile();
      if (response.success) {
        setProfile(response.data);
        if (response.data.profilePicture) {
          setProfilePicturePreview(response.data.profilePicture);
        }
      }
    } catch (err) {
      console.error('Error loading admin profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate new password if it's the new password field
    if (field === 'newPassword') {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await adminApiService.updateAdminProfile(formData);
      
      if (response.success) {
        setSuccess('Profile updated successfully');
        setProfilePicture(null); // Clear the file input
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password strength
      if (!validatePassword(passwordForm.newPassword)) {
        setError('Password does not meet security requirements');
        setLoading(false);
        return;
      }

      const response = await adminApiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordValidation({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        });
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
              </div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all duration-200"
              >
                <FiSettings className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </header>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <FiCheck className="mr-2" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal flex items-center">
                  <FiUser className="mr-2" />
                  Profile Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-coralblush to-pink-500 flex items-center justify-center">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-coralblush text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors">
                      <FiCamera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal">Profile Picture</h4>
                    <p className="text-sm text-gray-600">Click the camera icon to upload a new picture</p>
                    <p className="text-xs text-gray-500">Max size: 5MB, JPG/PNG only</p>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiMail className="mr-2" />
                    Email Address
                    <FiShield className="ml-2 text-gray-400" title="Email cannot be changed" />
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    title="Email address cannot be changed for security reasons"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                {/* Role Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
                  />
                </div>

                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FiSave className="mr-2" />
                  )}
                  Update Profile
                </button>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal flex items-center">
                  <FiLock className="mr-2" />
                  Change Password
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {passwordForm.newPassword && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-sm ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <FiCheck className={`mr-2 ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`} />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-sm ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <FiCheck className={`mr-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`} />
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-sm ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <FiCheck className={`mr-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`} />
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-sm ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <FiCheck className={`mr-2 ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`} />
                          One number
                        </div>
                        <div className={`flex items-center text-sm ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                          <FiCheck className={`mr-2 ${passwordValidation.special ? 'text-green-600' : 'text-gray-400'}`} />
                          One special character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  onClick={handlePasswordChangeSubmit}
                  disabled={loading || !isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.currentPassword}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <FiLock className="mr-2" />
                  )}
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FiShield className="mr-2" />
              Security Information
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <FiCheck className="mr-2 mt-0.5 text-blue-600" />
                <span>Your email address is protected and cannot be changed for security reasons</span>
              </div>
              <div className="flex items-start">
                <FiCheck className="mr-2 mt-0.5 text-blue-600" />
                <span>All password changes require verification of your current password</span>
              </div>
              <div className="flex items-start">
                <FiCheck className="mr-2 mt-0.5 text-blue-600" />
                <span>Profile pictures are securely stored and can be updated anytime</span>
              </div>
              <div className="flex items-start">
                <FiCheck className="mr-2 mt-0.5 text-blue-600" />
                <span>Strong password requirements help protect your account</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
