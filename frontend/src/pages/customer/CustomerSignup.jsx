import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiCheck } from "react-icons/fi";
import PhoneNumberInput from "../../components/PhoneNumberInput";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import API_CONFIG from "../../config/api";
import EmailVerificationPending from "../../components/EmailVerificationPending";

const CustomerSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Debounced email availability check
  useEffect(() => {
    const email = (formData.email || "").toLowerCase().trim();
    if (!email) return; // nothing to check
    if (!validateEmail(email)) return; // wait until format is valid

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_CONFIG.AUTH_SERVICE}/api/auth/check-email`, {
          params: { email }
        });
        const available = res?.data?.available;
        if (available === false) {
          setErrors(prev => ({ ...prev, email: res?.data?.message || "Email is already registered" }));
        } else {
          setErrors(prev => ({ ...prev, email: "" }));
        }
      } catch {
        // ignore network errors for availability check
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const validateIndianPhone = (phone) => {
    // Indian phone number validation: +91 followed by 10 digits or 10 digits starting with 6-9
    const phoneRegex = /^(\+91[\-\s]?)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 1;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) strength += 1;
    else feedback.push("Lowercase letter");

    if (/[A-Z]/.test(password)) strength += 1;
    else feedback.push("Uppercase letter");

    if (/[0-9]/.test(password)) strength += 1;
    else feedback.push("Number");

    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    else feedback.push("Special character");

    if (strength <= 2)
      return {
        level: "Poor",
        color: "text-red-500",
        bgColor: "bg-red-50",
        feedback,
      };
    if (strength <= 3)
      return {
        level: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        feedback,
      };
    return {
      level: "Strong",
      color: "text-green-600",
      bgColor: "bg-green-50",
      feedback,
    };
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "*Required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "First name can only contain letters and spaces";
        if (value.trim().length > 50)
          return "First name must be less than 50 characters";
        return "";

      case "lastName":
        if (!value.trim()) return "*Required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "Last name can only contain letters and spaces";
        if (value.trim().length > 50)
          return "Last name must be less than 50 characters";
        return "";

      case "email":
        if (!value.trim()) return "*Required";
        if (!validateEmail(value.trim()))
          return "Please enter a valid email address";
        if (value.trim().length > 100)
          return "Email must be less than 100 characters";
        return "";

      case "phone":
        if (!value.trim()) return "*Required";
        if (!validateIndianPhone(value.trim())) return "Please enter a valid Indian phone number";
        return "";

      case "password":
        if (!value) return "*Required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value.length > 128) return "Password must be less than 128 characters";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain at least one special character";
        return "";

      case "confirmPassword":
        if (!value) return "*Required";
        if (value !== formData.password) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Block numbers in name fields
    if ((name === "firstName" || name === "lastName") && /[0-9]/.test(value)) {
      return; // Don't update state if numbers are entered
    }
    
    // Allow + and spaces for international format; block other non-numeric characters
    if (name === "phone" && /[^0-9+\s]/.test(value)) {
      return; // Block letters and disallowed special characters
    }
    
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
    
    // Update password strength
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
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
    try {
      const response = await axios.post(`${API_CONFIG.AUTH_SERVICE}/api/customers/register`, {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response.data.success && response.data.requiresEmailVerification) {
        // Show email verification pending screen
        setRegisteredEmail(formData.email.toLowerCase().trim());
        setShowEmailVerification(true);
      } else if (response.data.success) {
        // Fallback - shouldn't happen for regular signup
        setErrors({ submit: "Registration successful but no verification required." });
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.AUTH_SERVICE}/api/auth/google-signin`, {
        idToken: credentialResponse.credential
      });

      if (response.data.success) {
        // Store user data and token - Google users are automatically verified
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('userRole', 'customer');
        
        navigate("/customer/landing");
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

  const handleBackFromVerification = () => {
    setShowEmailVerification(false);
    setRegisteredEmail("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  // If email verification is required, show the verification pending component
  if (showEmailVerification) {
    return (
      <EmailVerificationPending
        email={registeredEmail}
        userType="customer"
        onBack={handleBackFromVerification}
        onResend={() => {
          // Optional: Handle resend success
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-[#000714] font-bold text-lg">S</span>
            </div>
            <span className="text-[#000714] font-bold text-2xl ml-3">SewNova</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join SewNova</h1>
          <p className="text-gray-600">Create your customer account and start your fashion journey</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
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
                placeholder="Email Address"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <PhoneNumberInput
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="Enter phone number"
                className="w-full"
                variant="signup"
                focusColor="amber"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FiLock className="text-gray-400 text-lg" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 ml-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className={`p-4 rounded-2xl ${passwordStrength.bgColor} border border-gray-200`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    Password Strength: {passwordStrength.level}
                  </span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= passwordStrength.feedback.length
                            ? passwordStrength.color.replace('text-', 'bg-')
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p className="mb-1">Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {passwordStrength.feedback.map((req, index) => (
                      <span key={index} className="flex items-center">
                        <FiCheck className="text-green-500 mr-1 text-xs" />
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="ml-2 text-lg" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
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
          </form>

          {/* Links */}
          <div className="flex justify-center mt-6 text-sm">
            <Link to="/" className="text-gray-600 hover:text-amber-500 transition-colors mr-6">Back to Home</Link>
            <Link to="/login" className="text-gray-600 hover:text-amber-500 transition-colors">Already have an account?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;
