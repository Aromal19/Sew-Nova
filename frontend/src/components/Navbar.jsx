import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiHome, 
  FiGrid, 
  FiUsers, 
  FiShoppingBag, 
  FiSettings, 
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiShield,
  FiUser,
  FiShoppingCart
} from "react-icons/fi";

const Navbar = ({ userRole = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();

  // Handle scroll effect and active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Update active section based on scroll position
      const sections = ['home', 'workflow', 'features', 'tailors', 'vendors'];
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navItems = [
    { key: "home", label: "Home", icon: FiHome, href: "#home" },
    { key: "workflow", label: "How It Works", icon: FiGrid, href: "#workflow" },
    { key: "features", label: "Features", icon: FiShield, href: "#features" },
    { key: "tailors", label: "Tailors", icon: FiUser, href: "#tailors" },
    { key: "vendors", label: "Vendors", icon: FiShoppingBag, href: "#vendors" },
  ];

  const isActive = (sectionKey) => activeSection === sectionKey;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#000714]/95 backdrop-blur-md shadow-2xl border-b border-gray-800/50' 
        : 'bg-[#000714]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-amber-400/25 transition-all duration-300">
                <span className="text-[#000714] font-bold text-sm">S</span>
              </div>
              <span className="text-white font-bold text-lg ml-3 group-hover:text-amber-400 transition-colors duration-300">
                SewNova
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.key);
                
                return (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.key)}
                    className={`group relative flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      active 
                        ? 'bg-amber-500/20 text-white shadow-lg border border-amber-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    )}
                    
                    {/* Icon */}
                    <IconComponent 
                      className={`text-lg mr-2 transition-all duration-300 ${
                        active ? 'text-amber-400' : 'group-hover:text-amber-400'
                      }`} 
                    />
                    
                    {/* Label */}
                    <span className={active ? 'text-white' : 'text-gray-300'}>
                      {item.label}
                    </span>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      active 
                        ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5' 
                        : 'bg-gradient-to-r from-gray-800/0 to-gray-800/0 group-hover:from-gray-800/20 group-hover:to-gray-800/10'
                    }`}></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {userRole ? (
              // Logged in user
              <div className="flex items-center space-x-3">
                {/* Cart */}
                {userRole === 'customer' && (
                  <Link
                    to="/customer/cart"
                    className="group flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                  >
                    <FiShoppingCart className="text-lg group-hover:text-amber-400 transition-colors duration-300 mr-2" />
                    <span className="text-sm font-medium">Cart</span>
                  </Link>
                )}
                <div className="flex items-center px-3 py-2 rounded-lg bg-gray-800/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-[#000714] text-xs" />
                  </div>
                  <span className="text-white text-sm font-medium ml-2 capitalize">{userRole}</span>
                </div>
                <Link
                  to="/logout"
                  className="group flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-300"
                >
                  <FiLogIn className="text-lg group-hover:text-red-400 transition-colors duration-300 mr-2" />
                  <span className="text-sm font-medium">Logout</span>
                </Link>
              </div>
            ) : (
              // Guest user
              <>
                <Link
                  to="/login"
                  className="group flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                >
                  <FiLogIn className="text-lg group-hover:text-amber-400 transition-colors duration-300 mr-2" />
                  <span className="text-sm font-medium">Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="group flex items-center px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-[#000714] rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
                >
                  <FiUserPlus className="text-lg mr-2" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <FiMenu className="block h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pt-2 pb-4 space-y-2 bg-[#000714] border-t border-gray-800">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.key);
            
            return (
              <button
                key={item.key}
                onClick={() => {
                  scrollToSection(item.key);
                  setIsMenuOpen(false);
                }}
                className={`group flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  active 
                    ? 'bg-amber-500/20 text-white shadow-lg border border-amber-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full"></div>
                )}
                
                {/* Icon */}
                <IconComponent 
                  className={`text-xl mr-3 transition-all duration-300 ${
                    active ? 'text-amber-400' : 'group-hover:text-amber-400'
                  }`} 
                />
                
                {/* Label */}
                <span className={active ? 'text-white' : 'text-gray-300'}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* Mobile auth buttons */}
          <div className="pt-4 pb-2 border-t border-gray-800 space-y-2">
            {userRole ? (
              // Logged in user mobile
              <>
                <div className="flex items-center px-4 py-3 rounded-lg bg-gray-800/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-[#000714] text-xs" />
                  </div>
                  <span className="text-white text-sm font-medium ml-3 capitalize">{userRole}</span>
                </div>
                <Link
                  to="/logout"
                  className="group flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="text-lg group-hover:text-red-400 transition-colors duration-300 mr-3" />
                  <span className="text-sm font-medium">Logout</span>
                </Link>
              </>
            ) : (
              // Guest user mobile
              <>
                <Link
                  to="/login"
                  className="group flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiLogIn className="text-lg group-hover:text-amber-400 transition-colors duration-300 mr-3" />
                  <span className="text-sm font-medium">Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="group flex items-center px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-[#000714] rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUserPlus className="text-lg mr-3" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 