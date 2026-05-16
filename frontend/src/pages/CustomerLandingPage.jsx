import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, isAuthenticated, logout } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, FiMapPin, FiStar, FiHeart, FiShoppingCart, FiUser, FiLogOut, 
  FiFilter, FiGrid, FiList, FiTrendingUp, FiAward, FiScissors, FiShoppingBag,
  FiArrowRight, FiClock, FiCheckCircle, FiZap, FiPackage
} from "react-icons/fi";
import { getApiUrl } from "../config/api";
import API_CONFIG from "../config/api";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

const CustomerLandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const { items } = useCart();

  const [tailors, setTailors] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      setIsLoggedIn(authenticated);
      setUser(currentUser);
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

  // SweetAlert gender prompt when gender is not set
  const genderPromptShown = React.useRef(false);
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    if (user.gender) {
      genderPromptShown.current = true; // already has gender, never show
      return;
    }
    if (genderPromptShown.current) return; // already shown this session
    genderPromptShown.current = true;

    Swal.fire({
      title: '👋 Complete Your Profile',
      html: `
        <p style="margin-bottom: 16px; color: #6b7280; font-size: 14px;">
          Please select your gender to personalize your experience.
        </p>
        <select id="swal-gender-select" class="swal2-select" style="
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          color: #374151;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
        ">
          <option value="">-- Select Gender --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      `,
      confirmButtonText: 'Update',
      cancelButtonText: 'Go to Profile',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg',
      },
      preConfirm: () => {
        const genderValue = document.getElementById('swal-gender-select').value;
        if (!genderValue) {
          Swal.showValidationMessage('Please select a gender');
          return false;
        }
        return genderValue;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
          const response = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/customers/update-profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gender: result.value })
          });

          const data = await response.json();

          if (data.success) {
            // Update localStorage and state
            const updatedUser = { ...user, gender: result.value };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            Swal.fire({
              icon: 'success',
              title: 'Profile Updated!',
              text: 'Your gender has been saved successfully.',
              confirmButtonColor: '#f59e0b',
              timer: 2000,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text: data.message || 'Could not update gender. Please try from the profile page.',
              confirmButtonColor: '#f59e0b',
            });
          }
        } catch (error) {
          console.error('Error updating gender:', error);
          Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Could not connect to the server. Please try from the profile page.',
            confirmButtonColor: '#f59e0b',
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User chose to go to profile page
        navigate('/customer/profile');
      }
    });
  }, [isLoggedIn, user, navigate]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tailorsRes, productsRes] = await Promise.all([
          fetch(getApiUrl('TAILOR_SERVICE', '/api/public/tailors?page=1&limit=20')),
          fetch(getApiUrl('SELLER_SERVICE', '/api/public/products?page=1&limit=20'))
        ]);

        const tailorsJson = await tailorsRes.json();
        const tailorsData = Array.isArray(tailorsJson?.data) ? tailorsJson.data : [];
        const mappedTailors = tailorsData.map((t) => ({
          id: t._id,
          name: `${t.firstname || ''} ${t.lastname || ''}`.trim() || t.shopName || 'Tailor',
          location: t.district || t.state || t.address || '—',
          rating: Number(t.rating || 0),
          experience: t.experience ? `${t.experience} years` : '',
          speciality: Array.isArray(t.specialization) && t.specialization.length ? t.specialization[0] : 'Tailoring',
          image: t.profileImage || t.shopImage || '',
          price: '—',
          availability: t.isVerified ? 'Verified' : '—',
          reviews: t.totalOrders || 0,
          deliveryTime: ''
        }));
        setTailors(mappedTailors);

        const productsJson = await productsRes.json();
        const products = Array.isArray(productsJson?.data) ? productsJson.data : [];
        const mappedProducts = products.map((p) => ({
          id: p._id,
          name: p.name,
          type: p.category,
          price: typeof p.price === 'number' ? `₹${p.price}/${p.pricePerUnit === 'per_piece' ? 'pc' : p.pricePerUnit === 'per_yard' ? 'yd' : 'm'}` : '₹—',
          originalPrice: '',
          color: 'bg-gradient-to-br from-gray-100 to-gray-200',
          image: (Array.isArray(p.images) && p.images[0]?.url) || '',
          rating: Number(p?.rating?.average || 0),
          vendor: 'Verified Seller',
          reviews: Number(p?.rating?.count || 0),
          discount: ''
        }));
        setFabrics(mappedProducts);
      } catch (e) {
        console.error('Error loading landing data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar 
        key={i} 
        className={`w-3 h-3 ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`} 
      />
    ));
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`;
    if (user.firstname) return user.firstname;
    if (user.email) return user.email.split('@')[0];
    return "User";
  };

  const getUserInitial = () => {
    if (!user) return "?";
    if (user.firstname) return user.firstname.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const filteredTailors = tailors.filter(tailor => 
    tailor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tailor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tailor.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFabrics = fabrics.filter(fabric => 
    fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fabric.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fabric.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="explore" />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Discover & Create
                  </h1>
                  <p className="text-xs text-gray-600 mt-0.5">Find the perfect fabrics and expert tailors</p>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-xl mx-4">
                <div className="relative group">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search for fabrics, tailors, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm transition-all hover:border-gray-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Cart and User */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => navigate('/customer/cart')}
                  className="relative p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 group"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg group-hover:scale-110 transition-transform">
                      {items.length}
                    </span>
                  )}
                </button>

                {isLoggedIn && user ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-xs">
                          {getUserInitial()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium text-xs">{getUserDisplayName()}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-xs hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Tabs and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1.5">
                {[
                  { key: "all", label: "All", count: filteredTailors.length + filteredFabrics.length, icon: FiPackage },
                  { key: "tailors", label: "Tailors", count: filteredTailors.length, icon: FiScissors },
                  { key: "fabrics", label: "Fabrics", count: filteredFabrics.length, icon: FiShoppingBag }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 group-hover:bg-amber-200'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <FiGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50'
                  }`}
                >
                  <FiList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-500 absolute top-0"></div>
                  </div>
                  <p className="text-gray-600 font-medium text-sm">Loading amazing content...</p>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && (
              <>
                {/* Tailors Section */}
                {(activeTab === "all" || activeTab === "tailors") && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                          <FiScissors className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Expert Tailors</h2>
                          <p className="text-xs text-gray-600">{filteredTailors.length} skilled professionals available</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/customer/tailors')}
                        className="group flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-xs hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
                      >
                        <span>View All</span>
                        <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    
                    <div className={`grid gap-4 ${
                      viewMode === "grid" 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {filteredTailors.slice(0, 8).map((tailor) => (
                        <div key={tailor.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-amber-200 transition-all duration-300 overflow-hidden">
                          <div className="relative h-36 bg-gradient-to-br from-blue-100 to-purple-200 overflow-hidden">
                            {tailor.image ? (
                              <img
                                src={tailor.image}
                                alt={tailor.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center" style={{ display: tailor.image ? 'none' : 'flex' }}>
                              <FiScissors className="text-5xl text-blue-500" />
                            </div>
                            <div className="absolute top-2 right-2">
                              <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-md">
                                <FiHeart className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md flex items-center space-x-1">
                                <FiCheckCircle className="w-3 h-3" />
                                <span>{tailor.availability}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="mb-2">
                              <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-amber-600 transition-colors">
                                {tailor.name}
                              </h3>
                              <div className="flex items-center text-gray-500 text-xs mb-1">
                                <FiMapPin className="w-3 h-3 mr-1" />
                                {tailor.location}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(tailor.rating)}
                                <span className="text-xs font-semibold text-gray-700 ml-1">{tailor.rating}</span>
                                <span className="text-xs text-gray-500">({tailor.reviews})</span>
                              </div>
                              {tailor.experience && (
                                <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <FiAward className="w-3 h-3 mr-1" />
                                  {tailor.experience}
                                </div>
                              )}
                            </div>

                            {tailor.speciality && (
                              <div className="mb-3">
                                <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-medium rounded-full">
                                  {tailor.speciality}
                                </span>
                              </div>
                            )}

                            <button 
                              onClick={() => navigate(`/customer/tailor/${tailor.id || tailor._id || ''}`)} 
                              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-2 px-3 rounded-lg font-medium text-xs hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fabrics Section */}
                {(activeTab === "all" || activeTab === "fabrics") && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                          <FiShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Premium Fabrics</h2>
                          <p className="text-xs text-gray-600">{filteredFabrics.length} quality materials in stock</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/customer/fabrics')}
                        className="group flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium text-xs hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm hover:shadow-md"
                      >
                        <span>View All</span>
                        <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    
                    <div className={`grid gap-4 ${
                      viewMode === "grid" 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {filteredFabrics.slice(0, 8).map((fabric) => (
                        <div key={fabric.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden">
                          <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {fabric.image ? (
                              <img
                                src={fabric.image}
                                alt={fabric.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full ${fabric.color} flex items-center justify-center`} style={{ display: fabric.image ? 'none' : 'flex' }}>
                              <FiShoppingBag className="text-5xl text-gray-400" />
                            </div>
                            <div className="absolute top-2 right-2">
                              <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-md">
                                <FiHeart className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {fabric.discount && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                                  {fabric.discount}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="mb-2">
                              <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                {fabric.name}
                              </h3>
                              <div className="text-xs text-gray-600 mb-1">
                                {fabric.type} • {fabric.vendor}
                              </div>
                            </div>

                            <div className="flex items-center mb-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(fabric.rating)}
                                <span className="text-xs font-semibold text-gray-700 ml-1">{fabric.rating}</span>
                                <span className="text-xs text-gray-500">({fabric.reviews})</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                  {fabric.price}
                                </span>
                                {fabric.originalPrice && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {fabric.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button 
                              onClick={() => navigate('/customer/fabrics')} 
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-3 rounded-lg font-medium text-xs hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                            >
                              <FiShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {((activeTab === "tailors" && filteredTailors.length === 0) || 
                  (activeTab === "fabrics" && filteredFabrics.length === 0) ||
                  (activeTab === "all" && filteredTailors.length === 0 && filteredFabrics.length === 0)) && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FiSearch className="w-10 h-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                      We couldn't find any matches for your search. Try adjusting your filters or browse all categories.
                    </p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLandingPage;