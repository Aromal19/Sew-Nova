import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiGrid, 
  FiUsers, 
  FiShoppingBag, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiPackage,
  FiTruck,
  FiBarChart,
  FiShield,
  FiHeart,
  FiMapPin,
  FiTrendingUp,
  FiClipboard,
  FiBox,
  FiPlus,
  FiScissors,
  FiCalendar,
  FiDatabase,
  FiActivity,
  FiAward,
  FiMessageSquare,
  FiFileText,
  FiShoppingCart,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";
import { getCurrentUser, getUserRole, isAuthenticated, logout } from "../utils/api";

const Sidebar = ({ isOpen, setIsOpen, userRole = "customer" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("");
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(userRole);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      const role = getUserRole();
      
      setIsLoggedIn(authenticated);
      setUser(currentUser);
      setCurrentUserRole(role || userRole);
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'userRole') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userRole]);

  // Update active item based on current location
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentUserRole("customer");
    navigate('/login');
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return "Guest";
    
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    } else if (user.firstname) {
      return user.firstname;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  // Get user's initial for avatar
  const getUserInitial = () => {
    if (!user) return "G";
    
    if (user.firstname) {
      return user.firstname.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { key: "/dashboard", label: "Dashboard", icon: FiHome, href: currentUserRole === "customer" ? "/customer/dashboard" : `/dashboard/${currentUserRole}` },
    ];

    switch (currentUserRole) {
      case "customer":
        return [
          ...baseItems,
          { key: "/customer/landing", label: "Explore", icon: FiGrid, href: "/customer/landing" },
          { key: "/customer/cart", label: "Cart", icon: FiShoppingCart, href: "/customer/cart" },
          { key: "/customer/fabrics", label: "Browse Fabrics", icon: FiShoppingBag, href: "/customer/fabrics" },
          { key: "/customer/tailors", label: "Find Tailors", icon: FiScissors, href: "/customer/tailors" },
          { key: "/customer/measurements", label: "My Measurements", icon: FiUser, href: "/customer/measurements" },
          { key: "/customer/addresses", label: "My Addresses", icon: FiMapPin, href: "/customer/addresses" },
          { key: "/customer/bookings", label: "My Bookings", icon: FiPackage, href: "/customer/bookings" },
          { key: "/customer/orders", label: "My Orders", icon: FiClipboard, href: "/customer/orders" },

          { key: "/customer/tracking", label: "Order Tracking", icon: FiTruck, href: "/customer/tracking" },
          { key: "/customer/profile", label: "Profile", icon: FiUser, href: "/customer/profile" },
        ];
      
      case "seller":
        return [
          ...baseItems,
          { key: "/fabrics", label: "My Fabrics", icon: FiBox, href: "/fabrics" },
          { key: "/add-fabric", label: "Add Fabric", icon: FiPlus, href: "/add-fabric" },
          { key: "/vendor/deliveries", label: "My Shipments", icon: FiTruck, href: "/vendor/deliveries" },
          { key: "/inventory", label: "Inventory", icon: FiDatabase, href: "/inventory" },
          { key: "/analytics", label: "Analytics", icon: FiBarChart, href: "/analytics" },
          { key: "/seller/profile", label: "Profile", icon: FiUser, href: "/seller/profile" },
        ];
      
      case "tailor":
        return [
          ...baseItems,
          { key: "/tailor/active-orders", label: "Active Orders", icon: FiPackage, href: "/tailor/active-orders" },
          // Temporarily hidden items: completed, pending, workflow, schedule, appointments, earnings, customer, reviews
          // { key: "/completed-orders", label: "Completed", icon: FiCheckCircle, href: "/completed-orders" },
          // { key: "/pending-orders", label: "Pending", icon: FiClock, href: "/pending-orders" },
          // { key: "/workflow", label: "Workflow", icon: FiGrid, href: "/workflow" },
          // { key: "/schedule", label: "Schedule", icon: FiCalendar, href: "/schedule" },
          // { key: "/appointments", label: "Appointments", icon: FiMessageSquare, href: "/appointments" },
          // { key: "/earnings", label: "Earnings", icon: FiTrendingUp, href: "/earnings" },
          // { key: "/customers", label: "Customers", icon: FiUsers, href: "/customers" },
          // { key: "/reviews", label: "Reviews", icon: FiStar, href: "/reviews" },
          { key: "/tailor/profile", label: "Profile", icon: FiUser, href: "/tailor/profile" },
        ];
      
      case "admin":
        return [
          ...baseItems,
          { key: "/admin/dashboard", label: "Dashboard", icon: FiActivity, href: "/admin/dashboard" },
          { key: "/admin/users", label: "Manage Users", icon: FiUsers, href: "/admin/users" },
          { key: "/admin/orders", label: "Order Management", icon: FiPackage, href: "/admin/orders" },
          { key: "/admin/deliveries", label: "Delivery Monitoring", icon: FiTruck, href: "/admin/deliveries" },
          { key: "/admin/designs", label: "Design Management", icon: FiGrid, href: "/admin/designs" },
          { key: "/analytics", label: "Analytics", icon: FiBarChart, href: "/analytics" },
          { key: "/insights", label: "Insights", icon: FiTrendingUp, href: "/insights" },
          { key: "/reports", label: "Reports", icon: FiFileText, href: "/reports" },
          { key: "/admin/settings", label: "Settings", icon: FiSettings, href: "/admin/settings" },
        ];
      
      default:
        return [
          { key: "/", label: "Home", icon: FiHome, href: "/" },
          { key: "/workflow", label: "How It Works", icon: FiGrid, href: "#workflow" },
          { key: "/features", label: "Features", icon: FiShield, href: "#features" },
          { key: "/tailors", label: "Tailors", icon: FiUser, href: "#tailors" },
          { key: "/vendors", label: "Vendors", icon: FiShoppingBag, href: "#vendors" },
        ];
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin": return "Administrator";
      case "seller": return "Fabric Seller";
      case "tailor": return "Tailor";
      case "customer": return "Customer";
      default: return "Guest";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return FiShield;
      case "seller": return FiShoppingBag;
      case "tailor": return FiScissors;
      case "customer": return FiUser;
      default: return FiUser;
    }
  };

  const navItems = getNavItems();
  const RoleIcon = getRoleIcon(currentUserRole);

  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } bg-[#000714] border-r border-gray-800 flex flex-col min-h-screen transition-all duration-500 ease-in-out shadow-2xl`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-start">
          <div className="w-8 h-8 bg-gradient-to-r from-coralblush to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {isOpen && (
            <span className="text-white font-bold text-lg ml-3 opacity-0 animate-fadeIn">
              SewNova
            </span>
          )}
        </div>
      </div>

      {/* Role Badge */}
      {isOpen && (
        <div className="px-4 py-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-lilac to-purple-500 rounded-full flex items-center justify-center">
              <RoleIcon className="text-white text-xs" />
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {getRoleDisplayName(currentUserRole)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.key;
            
            return (
              <li key={item.key}>
                <Link
                  to={item.href}
                  className={`group relative flex items-center px-3 py-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    isActive 
                      ? 'bg-coralblush/20 text-white shadow-lg border border-coralblush/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  } ${!isOpen ? 'justify-center' : ''}`}
                  title={!isOpen ? item.label : ''}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-coralblush to-pink-500 rounded-r-full"></div>
                  )}
                  
                  {/* Icon */}
                  <IconComponent 
                    className={`text-xl transition-all duration-300 ${
                      isActive ? 'text-coralblush' : 'group-hover:text-coralblush'
                    }`} 
                  />
                  
                  {/* Label */}
                  {isOpen && (
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}>
                      {item.label}
                    </span>
                  )}
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-coralblush/10 to-coralblush/5' 
                      : 'bg-gradient-to-r from-gray-800/0 to-gray-800/0 group-hover:from-gray-800/20 group-hover:to-gray-800/10'
                  }`}></div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        {/* User Profile */}
        <div className={`flex items-center px-3 py-2 rounded-lg bg-gray-800/30 ${
          !isOpen ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 bg-gradient-to-r from-coralblush to-pink-500 rounded-full flex items-center justify-center">
            {isLoggedIn ? (
              <span className="text-white text-sm font-bold">
                {getUserInitial()}
              </span>
            ) : (
              <FiUser className="text-white text-sm" />
            )}
          </div>
          {isOpen && (
            <div className="ml-3 flex-1">
              <p className="text-white text-sm font-medium">
                {isLoggedIn ? getUserDisplayName() : "Guest"}
              </p>
              <p className="text-gray-400 text-xs capitalize">
                {getRoleDisplayName(currentUserRole)}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions based on role */}
        {isOpen && isLoggedIn && (
          <div className="px-3 py-2">
            {currentUserRole === "seller" && (
              <Link
                to="/add-fabric"
                className="flex items-center px-3 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg text-sm font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add New Fabric
              </Link>
            )}
            {currentUserRole === "tailor" && (
              <Link
                to="/tailor/active-orders"
                className="flex items-center px-3 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg text-sm font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300"
              >
                <FiPackage className="w-4 h-4 mr-2" />
                View Active Orders
              </Link>
            )}
            {currentUserRole === "admin" && (
              <Link
                to="/insights"
                className="flex items-center px-3 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg text-sm font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300"
              >
                <FiTrendingUp className="w-4 h-4 mr-2" />
                View Insights
              </Link>
            )}
          </div>
        )}

        {/* Login/Logout Button */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className={`group flex items-center px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-600/20 transition-all duration-300 w-full ${
              !isOpen ? 'justify-center' : ''
            }`}
            title={!isOpen ? 'Logout' : ''}
          >
            <FiLogOut className="text-lg group-hover:text-red-400 transition-colors duration-300" />
            {isOpen && (
              <span className="ml-3 text-sm font-medium">Logout</span>
            )}
          </button>
        ) : (
          <Link
            to="/login"
            className={`group flex items-center px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-green-600/20 transition-all duration-300 ${
              !isOpen ? 'justify-center' : ''
            }`}
            title={!isOpen ? 'Login' : ''}
          >
            <FiUser className="text-lg group-hover:text-green-400 transition-colors duration-300" />
            {isOpen && (
              <span className="ml-3 text-sm font-medium">Login</span>
            )}
          </Link>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 group"
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? (
            <FiChevronLeft className="text-lg group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <FiChevronRight className="text-lg group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 