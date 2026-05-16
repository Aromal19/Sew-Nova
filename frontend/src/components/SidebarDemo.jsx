import React, { useState } from "react";
import Sidebar from "./Sidebar";

const SidebarDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentRole, setCurrentRole] = useState("customer");

  const roles = [
    { value: "customer", label: "Customer", color: "bg-blue-500" },
    { value: "seller", label: "Seller", color: "bg-green-500" },
    { value: "tailor", label: "Tailor", color: "bg-purple-500" },
    { value: "admin", label: "Admin", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole={currentRole} 
      />
      
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ease-in-out ${
        sidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sidebar Demo</h1>
            <p className="text-gray-600 mb-6">
              This demo showcases the redesigned sidebar with different user roles and animations.
            </p>
            
            {/* Role Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setCurrentRole(role.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentRole === role.value
                      ? `${role.color} text-white shadow-lg`
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
            >
              {sidebarOpen ? 'Collapse' : 'Expand'} Sidebar
            </button>
          </header>
          
          {/* Demo Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Current Role: <span className="capitalize text-amber-600">{currentRole}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Features</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Smooth animations</li>
                  <li>• Role-based navigation</li>
                  <li>• Active state indicators</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Colors</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Background: #000714</li>
                  <li>• Active: #011336</li>
                  <li>• Accent: Amber/Orange</li>
                  <li>• Text: Gray scale</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Animations</h3>
                <ul className="text-purple-700 space-y-1">
                  <li>• Hover effects</li>
                  <li>• Scale transitions</li>
                  <li>• Fade in/out</li>
                  <li>• Smooth toggles</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
              <p className="text-gray-600">
                Try switching between different user roles to see how the sidebar navigation changes. 
                Each role has different menu items relevant to their specific needs. You can also 
                toggle the sidebar to see the smooth collapse/expand animations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SidebarDemo; 