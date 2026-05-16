import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/api";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout function to clear all stored data and notify backend
        await logout();
        
        // Redirect to the landing page
        navigate("/", { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to landing page
        navigate("/", { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f29d]/20 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout; 