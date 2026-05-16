import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, getDashboardRoute } from "../utils/api";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import API_CONFIG from "../config/api";
import EmailVerificationPending from "../components/EmailVerificationPending";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "*Required";
        if (!validateEmail(value.trim()))
          return "Please enter a valid email address";
        if (value.trim().length > 100)
          return "Email must be less than 100 characters";
        return "";

      case "password":
        if (!value) return "*Required";
        if (value.length < 1) return "Password is required";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation on keyup
    if (value.trim() !== "" || errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      // Regular user login using API utility (includes admin)
      const data = await authAPI.login(formData.email, formData.password);

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userRole', data.user.role);

        console.log('Login successful, user role:', data.user.role);
        console.log('User data:', data.user);

        // Route based on user role - customers go to landing page, others to dashboard
        if (data.user.role === 'customer') {
          console.log('Redirecting to customer landing');
          navigate('/customer/landing');
        } else {
          const dashboardRoute = getDashboardRoute(data.user.role);
          console.log('Redirecting to dashboard route:', dashboardRoute);
          navigate(dashboardRoute);
        }
      } else if (data.requiresEmailVerification) {
        // Show email verification pending screen
        setVerificationData({
          email: data.email,
          userType: data.userType
        });
        setShowEmailVerification(true);
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrors({});
    try {
      const response = await axios.post(`${API_CONFIG.AUTH_SERVICE}/api/auth/google-signin`, {
        idToken: credentialResponse.credential
      }, { withCredentials: true });
      if (response.data.success) {
        // Store user data and accessToken
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('userRole', response.data.user.role);
        // Route based on user role
        if (response.data.user.role === 'customer') {
          navigate('/customer/landing');
        } else {
          const dashboardRoute = getDashboardRoute(response.data.user.role);
          navigate(dashboardRoute);
        }
      } else {
        setErrors({ submit: response.data.message || "Google Sign-In failed" });
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Google Sign-In failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ submit: "Google Sign-In failed. Please try again." });
  };

  // If email verification is required, show the verification pending component
  if (showEmailVerification) {
    return (
      <EmailVerificationPending
        email={verificationData.email}
        userType={verificationData.userType}
        onBack={() => {
          setShowEmailVerification(false);
          setVerificationData({});
        }}
        onResend={() => {
          // Optional: Handle resend success
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f29d]/20 to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-[#000714] font-bold text-lg">S</span>
            </div>
            <span className="text-[#000714] font-bold text-2xl ml-3">SewNova</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your SewNova account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FiMail className="text-gray-400 text-lg" />
              </div>
              <input
                type="email"
                name="email"
                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                }`}
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Email Address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 ml-1">{errors.email}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FiLock className="text-gray-400 text-lg" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                }`}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-1">{errors.password}</p>
              )}
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
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-amber-400/50 transform hover:scale-105 text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="ml-2 text-lg" />
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            
            {/* Google Sign In */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                auto_select={false}
                cancel_on_tap_outside={false}
              />
            </div>
          </div>
          
          {/* Links */}
          <div className="flex justify-center mt-6 text-sm">
            <Link to="/" className="text-gray-600 hover:text-amber-500 transition-colors mr-6">Back to Home</Link>
            <Link to="/signup" className="text-gray-600 hover:text-amber-500 transition-colors">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 