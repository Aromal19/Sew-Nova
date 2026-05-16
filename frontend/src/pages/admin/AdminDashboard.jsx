import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import SimpleChart from "../../components/charts/SimpleChart";
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiPackage,
  FiDollarSign,
  FiShoppingBag,
  FiScissors,
  FiPlus,
  FiFilter,
  FiSearch,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiLogOut,
  FiSettings,
  FiBarChart,
  FiGrid,
  FiUserPlus,
  FiUserMinus,
  FiLoader,
  FiTag,
  FiUser
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated, logout } from "../../utils/api";
import { adminApiService } from "../../services/adminApiService";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  
  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // User management states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Design management states
  const [designSearchTerm, setDesignSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [designCurrentPage, setDesignCurrentPage] = useState(1);
  const [designsPerPage] = useState(12);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAdminAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      loadDashboardData();
    }
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  useEffect(() => {
    filterDesigns();
  }, [designs, designSearchTerm, selectedCategory]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load analytics data
      const analyticsData = await adminApiService.getAnalytics(timeRange);
      setAnalytics(analyticsData.data);
      
      // Load users data
      const usersData = await adminApiService.getAllUsers({
        page: 1,
        limit: 100
      });
      if (usersData.success) {
        setUsers(usersData.data.users);
      }
      
      // Load designs data
      const designsData = await adminApiService.getDesigns({
        page: 1,
        limit: 100
      });
      if (designsData.success) {
        setDesigns(designsData.data.designs || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  };

  const filterDesigns = () => {
    let filtered = designs;
    
    if (designSearchTerm) {
      filtered = filtered.filter(design => 
        design.name?.toLowerCase().includes(designSearchTerm.toLowerCase()) ||
        design.description?.toLowerCase().includes(designSearchTerm.toLowerCase()) ||
        design.tags?.some(tag => tag.toLowerCase().includes(designSearchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(design => design.category === selectedCategory);
    }
    
    setFilteredDesigns(filtered);
  };

  const handleUserAction = async (action, userId, data = null) => {
    setLoading(true);
    try {
      switch (action) {
        case 'updateStatus':
          await adminService.updateUserStatus(userId, data.status);
          // Update local state
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, status: data.status } : user
          ));
          break;
        case 'delete':
          await adminService.deleteUser(userId);
          // Remove from local state
          setUsers(prev => prev.filter(user => user.id !== userId));
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(`Failed to ${action} user. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Get stats from analytics data or use defaults
  const getStats = () => {
    if (!analytics) {
      return [
        {
          title: "Total Users",
          value: "0",
          change: "0%",
          trend: "up",
          icon: FiUsers,
          color: "from-coralblush to-pink-500"
        },
        {
          title: "Total Orders",
          value: "0",
          change: "0%",
          trend: "up",
          icon: FiPackage,
          color: "from-lilac to-purple-500"
        },
        {
          title: "Total Revenue",
          value: "₹0",
          change: "0%",
          trend: "up",
          icon: FiDollarSign,
          color: "from-champagne to-yellow-500"
        },
        {
          title: "Active Tailors",
          value: "0",
          change: "0",
          trend: "up",
          icon: FiScissors,
          color: "from-mint to-green-500"
        },
        {
          title: "Active Sellers",
          value: "0",
          change: "0",
          trend: "up",
          icon: FiShoppingBag,
          color: "from-blue-500 to-indigo-500"
        },
        {
          title: "Pending Orders",
          value: "0",
          change: "0%",
          trend: "down",
          icon: FiClock,
          color: "from-purple-500 to-pink-500"
        }
      ];
    }

    const overview = analytics.overview || {};
    return [
      {
        title: "Total Users",
        value: overview.totalUsers?.toLocaleString() || "0",
        change: "+12.5%",
        trend: "up",
        icon: FiUsers,
        color: "from-coralblush to-pink-500"
      },
      {
        title: "Total Orders",
        value: overview.totalOrders?.toLocaleString() || "0",
        change: "+8.2%",
        trend: "up",
        icon: FiPackage,
        color: "from-lilac to-purple-500"
      },
      {
        title: "Total Revenue",
        value: `₹${overview.totalRevenue?.toLocaleString() || "0"}`,
        change: "+15.3%",
        trend: "up",
        icon: FiDollarSign,
        color: "from-champagne to-yellow-500"
      },
      {
        title: "Active Tailors",
        value: overview.activeTailors?.toString() || "0",
        change: "+3",
        trend: "up",
        icon: FiScissors,
        color: "from-mint to-green-500"
      },
      {
        title: "Active Sellers",
        value: overview.activeSellers?.toString() || "0",
        change: "+2",
        trend: "up",
        icon: FiShoppingBag,
        color: "from-blue-500 to-indigo-500"
      },
      {
        title: "Pending Orders",
        value: overview.pendingOrders?.toString() || "0",
        change: "-5.2%",
        trend: "down",
        icon: FiClock,
        color: "from-purple-500 to-pink-500"
      }
    ];
  };

  const stats = getStats();

  // Get recent users from filtered data
  const getRecentUsers = () => {
    return filteredUsers
      .sort((a, b) => new Date(b.joinDate || b.createdAt) - new Date(a.joinDate || a.createdAt))
      .slice(0, 3)
      .map(user => ({
        id: user.id || user._id,
        name: user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown',
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        joinDate: user.joinDate || user.createdAt,
        lastActive: user.lastActive || user.lastLogin || 'Unknown'
      }));
  };

  const recentUsers = getRecentUsers();

  // Recent orders will be fetched from order service in future implementation
  const recentOrders = [];

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "customer": return "bg-blue-100 text-blue-800";
      case "tailor": return "bg-purple-100 text-purple-800";
      case "seller": return "bg-green-100 text-green-800";
      case "admin": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Monitor your platform, manage users, and track performance.</p>
              </div>
            <div className="flex items-center space-x-4">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                {/* Settings button */}
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                  title="Settings"
                >
                  <FiSettings className="mr-2" />
                  Settings
                </button>
                {/* Logout button */}
              <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all duration-200"
                  title="Logout"
              >
                  <FiLogOut className="mr-2" />
                  Logout
              </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.trend === "up" ? (
                          <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </header>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "orders", label: "Orders" },
                  { id: "designs", label: "Designs" },
                  { id: "analytics", label: "Analytics" },
                  { id: "settings", label: "Settings" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-coralblush text-coralblush"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-charcoal">Revenue Trend</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiDownload className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiEye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-coralblush/5 to-lilac/5 rounded-lg p-4">
                    <SimpleChart
                      type="line"
                      data={analytics?.revenue?.data || [15000, 18000, 22000, 25000, 20000, 25000]}
                      labels={analytics?.revenue?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                      height={200}
                      color="#F26A8D"
                      title=""
                    />
                  </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-charcoal">User Growth</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiFilter className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="h-64 bg-gradient-to-br from-lilac/5 to-champagne/5 rounded-lg p-4">
                    <SimpleChart
                      type="bar"
                      data={analytics?.userGrowth?.data || [120, 145, 168, 195]}
                      labels={analytics?.userGrowth?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                      height={200}
                      color="#CDB4DB"
                      title=""
                    />
                  </div>
                </div>
              </div>

              {/* Recent Users & Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-charcoal">Recent Users</h3>
                      <button className="text-coralblush hover:text-pink-500 text-sm font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-coralblush to-pink-500 rounded-lg flex items-center justify-center">
                              <FiUsers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">Joined {user.joinDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{user.lastActive}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-charcoal">Recent Orders</h3>
                      <button className="text-coralblush hover:text-pink-500 text-sm font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-champagne to-yellow-500 rounded-lg flex items-center justify-center">
                              <FiPackage className="w-5 h-5 text-charcoal" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal">{order.id}</p>
                              <p className="text-sm text-gray-600">{order.customer}</p>
                              <p className="text-xs text-gray-500">{order.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal">{order.amount}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-charcoal">Order Management</h3>
                    <button 
                      onClick={() => navigate('/admin/orders')}
                      className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300 flex items-center space-x-2"
                    >
                      <FiPackage className="w-4 h-4" />
                      <span>Manage Orders</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
                    <p className="text-gray-500 mb-6">View and manage all customer orders across the platform</p>
                    <button 
                      onClick={() => navigate('/admin/orders')}
                      className="px-6 py-3 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Go to Orders Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "designs" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-charcoal">Design Management</h3>
                    <button className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300 flex items-center space-x-2">
                      <FiPlus className="w-4 h-4" />
                      <span>Add Design</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock design cards */}
                    {[1, 2, 3, 4, 5, 6].map((design) => (
                      <div key={design} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="w-full h-32 bg-gradient-to-br from-coralblush/20 to-lilac/20 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-charcoal mb-2">Design {design}</h4>
                        <p className="text-sm text-gray-600 mb-3">Beautiful design description</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-charcoal">₹{500 + design * 100}</span>
                          <div className="flex space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <FiEdit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <FiTrash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <FiLoader className="w-8 h-8 text-coralblush animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading analytics...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Analytics Content */}
              {!loading && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">Order Status Distribution</h3>
                    <div className="h-64 bg-gradient-to-br from-mint/5 to-green-500/5 rounded-lg p-4">
                      <SimpleChart
                        type="pie"
                        data={[
                          analytics.orderStatus?.completed || 0,
                          analytics.orderStatus?.pending || 0,
                          analytics.orderStatus?.inProgress || 0,
                          analytics.orderStatus?.cancelled || 0
                        ]}
                        labels={['Completed', 'Pending', 'In Progress', 'Cancelled']}
                        height={200}
                        color="#EDFDF6"
                        title=""
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">User Activity</h3>
                    <div className="h-64 bg-gradient-to-br from-champagne/5 to-yellow-500/5 rounded-lg p-4">
                      <SimpleChart
                        type="bar"
                        data={analytics.orders?.data || [120, 135, 110, 145, 130, 95, 80]}
                        labels={analytics.orders?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                        height={200}
                        color="#F6E7D7"
                        title=""
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Top Performers */}
              {!loading && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">Top Tailors</h3>
                    <div className="space-y-3">
                      {analytics.topTailors?.map((tailor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-charcoal">{tailor.name}</p>
                            <p className="text-sm text-gray-600">{tailor.orders} orders • Rating: {tailor.rating}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal">₹{tailor.revenue?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Revenue</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No tailor data available</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-charcoal mb-4">Top Sellers</h3>
                    <div className="space-y-3">
                      {analytics.topSellers?.map((seller, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-charcoal">{seller.name}</p>
                            <p className="text-sm text-gray-600">{seller.products} products • {seller.sales} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal">₹{seller.revenue?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Revenue</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No seller data available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "designs" && (
            <div className="space-y-6">
              {/* Design Showcase Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal">Design Showcase</h2>
                  <p className="text-gray-600 mt-1">Manage and showcase your design catalog</p>
                </div>
                <button
                  onClick={() => navigate('/admin/designs')}
                  className="flex items-center px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <FiPlus className="mr-2" />
                  Manage Designs
                </button>
              </div>

              {/* Design Filters */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search designs..."
                        value={designSearchTerm}
                        onChange={(e) => setDesignSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="traditional">Traditional</option>
                    <option value="western">Western</option>
                    <option value="ethnic">Ethnic</option>
                    <option value="party">Party</option>
                    <option value="wedding">Wedding</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>

              {/* Design Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDesigns.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FiGrid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No designs found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => navigate('/admin/designs')}
                      className="px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Add New Design
                    </button>
                  </div>
                ) : (
                  filteredDesigns.slice(0, 12).map((design) => (
                    <div key={design._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-w-3 aspect-h-4">
                        <img
                          src={design.image || '/images/default-design.jpg'}
                          alt={design.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-lilac bg-opacity-10 text-lilac">
                            {design.category}
                          </span>
                          <span className="text-sm font-medium text-charcoal">
                            ₹{design.price || 0}
                          </span>
                        </div>
                        <h3 className="font-medium text-charcoal mb-1 line-clamp-1">
                          {design.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {design.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {design.estimatedTime || 0}h
                          </span>
                          <span className="capitalize">{design.difficulty}</span>
                        </div>
                        {design.tags && design.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {design.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {design.tags.length > 2 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{design.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Design Statistics */}
              {designs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Designs</p>
                        <p className="text-2xl font-bold text-charcoal">{designs.length}</p>
                      </div>
                      <div className="p-3 bg-coralblush bg-opacity-10 rounded-lg">
                        <FiGrid className="w-6 h-6 text-coralblush" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Categories</p>
                        <p className="text-2xl font-bold text-charcoal">
                          {[...new Set(designs.map(d => d.category))].length}
                        </p>
                      </div>
                      <div className="p-3 bg-lilac bg-opacity-10 rounded-lg">
                        <FiTag className="w-6 h-6 text-lilac" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Price</p>
                        <p className="text-2xl font-bold text-charcoal">
                          ₹{Math.round(designs.reduce((sum, d) => sum + (d.price || 0), 0) / designs.length)}
                        </p>
                      </div>
                      <div className="p-3 bg-champagne bg-opacity-10 rounded-lg">
                        <FiDollarSign className="w-6 h-6 text-champagne" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Time</p>
                        <p className="text-2xl font-bold text-charcoal">
                          {Math.round(designs.reduce((sum, d) => sum + (d.estimatedTime || 0), 0) / designs.length)}h
                        </p>
                      </div>
                      <div className="p-3 bg-mint bg-opacity-10 rounded-lg">
                        <FiClock className="w-6 h-6 text-mint" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-charcoal">System Settings</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        defaultValue="SewNova"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                      <input
                        type="email"
                        defaultValue="admin@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                      <textarea
                        rows={3}
                        defaultValue="Your one-stop platform for custom tailoring and fashion design"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                      />
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300">
                      Save Settings
                    </button>
                  </div>
                </div>
          </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 