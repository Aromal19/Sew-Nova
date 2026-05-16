import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { BookingProvider } from "./context/BookingContext";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import SignupSelection from "./pages/SignupSelection";
import Signup from "./pages/admin/Signup";
import CustomerSignup from "./pages/customer/CustomerSignup";
import SellerSignup from "./pages/seller/SellerSignup";
import TailorSignup from "./pages/tailor/TailorSignup";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CustomerLandingPage from "./pages/CustomerLandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { GOOGLE_CLIENT_ID } from "./config/googleOAuth";
import { initializeErrorHandlers } from "./utils/errorHandler";
import "./App.css";

// Initialize error handlers for Razorpay and other browser errors
initializeErrorHandlers();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <Router>
        <CartProvider>
        <BookingProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<SignupSelection />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route path="/seller/signup" element={<SellerSignup />} />
          <Route path="/tailor/signup" element={<TailorSignup />} />
          <Route path="/dashboard/customer" element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLandingPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/landing" element={
            <ProtectedRoute requiredRole="customer">
              <CustomerLandingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/seller" element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/*" element={<App />} />
        </Routes>
        </BookingProvider>
        </CartProvider>
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
