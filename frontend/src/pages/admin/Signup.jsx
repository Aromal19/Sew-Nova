import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiShield } from "react-icons/fi";
import axios from "axios";
import API_CONFIG from "../../config/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    userType: "customer",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateIndianPhone = (phone) => {
    const phoneRegex = /^(\+91[\-\s]?)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!validateIndianPhone(formData.phone)) newErrors.phone = "Please enter a valid Indian phone number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_CONFIG.AUTH_SERVICE}/api/auth/admin/signup`, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        userType: formData.userType,
        password: formData.password,
        role: "admin",
      });

      if (response.data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('userRole', 'admin');
        
        navigate("/admin/dashboard");
      } else {
        setErrors({ submit: response.data.message || "Signup failed" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Network error. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f29d]/20 to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-[#000714] font-bold text-lg">S</span>
            </div>
            <span className="text-[#000714] font-bold text-2xl ml-3">SewNova</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Registration</h1>
          <p className="text-gray-600">Create an admin account to manage the platform</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.firstName}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="username"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.username ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.username}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 text-lg" />
                </div>
                <input
                  type="email"
                  name="email"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone and User Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400 text-lg" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.phone}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiShield className="text-gray-400 text-lg" />
                </div>
                <select
                  name="userType"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm border ${
                    errors.userType ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="tailor">Tailor</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.userType && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.userType}</p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 text-lg" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-400/50 transform hover:scale-105 text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Admin Account
                  <FiArrowRight className="ml-2 text-lg" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="flex justify-center mt-6 text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors mr-6">Back to Home</Link>
            <Link to="/login" className="text-gray-600 hover:text-blue-500 transition-colors">Already have an account?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 