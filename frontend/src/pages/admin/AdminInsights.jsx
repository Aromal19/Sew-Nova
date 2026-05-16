import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import SimpleChart from "../../components/charts/SimpleChart";
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiShoppingBag, 
  FiScissors, 
  FiPackage,
  FiStar,
  FiActivity,
  FiBarChart,
  FiMapPin,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";

const AdminInsights = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data for insights
  const platformStats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: FiUsers,
      color: "from-coralblush to-pink-500"
    },
    {
      title: "Active Sellers",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: FiShoppingBag,
      color: "from-lilac to-purple-500"
    },
    {
      title: "Active Tailors",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: FiScissors,
      color: "from-champagne to-yellow-500"
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+22.1%",
      trend: "up",
      icon: FiPackage,
      color: "from-mint to-green-500"
    },
    {
      title: "Revenue",
      value: "₹45,678",
      change: "+18.7%",
      trend: "up",
      icon: FiTrendingUp,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Avg Rating",
      value: "4.6",
      change: "+0.3",
      trend: "up",
      icon: FiStar,
      color: "from-purple-500 to-pink-500"
    }
  ];

  const topSellers = [
    { name: "Premium Fabrics Co.", orders: 234, revenue: "₹12,450", rating: 4.8 },
    { name: "Silk & Cotton Hub", orders: 189, revenue: "₹9,870", rating: 4.7 },
    { name: "Fabric World", orders: 156, revenue: "₹8,230", rating: 4.6 },
    { name: "Textile Masters", orders: 134, revenue: "₹7,120", rating: 4.5 },
    { name: "Quality Fabrics", orders: 98, revenue: "₹5,890", rating: 4.4 }
  ];

  const topTailors = [
    { name: "Sarah Johnson", orders: 89, earnings: "₹4,560", rating: 4.9 },
    { name: "Mike Chen", orders: 76, earnings: "₹3,890", rating: 4.8 },
    { name: "Emma Davis", orders: 65, earnings: "₹3,340", rating: 4.7 },
    { name: "Alex Wilson", orders: 54, earnings: "₹2,780", rating: 4.6 },
    { name: "Lisa Brown", orders: 43, earnings: "₹2,210", rating: 4.5 }
  ];

  const recentActivities = [
    { type: "order", message: "New order #ORD-1234 placed by Customer A", time: "2 min ago", status: "pending" },
    { type: "seller", message: "Premium Fabrics Co. added 5 new products", time: "15 min ago", status: "completed" },
    { type: "tailor", message: "Sarah Johnson completed order #ORD-1230", time: "1 hour ago", status: "completed" },
    { type: "dispute", message: "Dispute raised for order #ORD-1228", time: "2 hours ago", status: "pending" },
    { type: "customer", message: "New customer registration: John Smith", time: "3 hours ago", status: "completed" }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "order": return FiPackage;
      case "seller": return FiShoppingBag;
      case "tailor": return FiScissors;
      case "customer": return FiUsers;
      case "dispute": return FiAlertCircle;
      default: return FiActivity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "order": return "text-blue-500";
      case "seller": return "text-green-500";
      case "tailor": return "text-purple-500";
      case "customer": return "text-coralblush";
      case "dispute": return "text-red-500";
      default: return "text-gray-500";
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
                <h1 className="text-3xl font-bold text-charcoal">Platform Insights</h1>
                <p className="text-gray-600 mt-2">Comprehensive analytics and insights about your platform performance.</p>
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
                <button className="px-6 py-3 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-semibold hover:from-pink-500 hover:to-coralblush transition-all duration-300 shadow-lg flex items-center space-x-2">
                  <FiBarChart className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {platformStats.map((stat, index) => (
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-charcoal">User Growth</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Monthly</span>
                </div>
              </div>
              <div className="h-64">
                <SimpleChart
                  type="line"
                  data={[1200, 1350, 1420, 1580, 1680, 1840, 2100, 2340, 2560, 2847]}
                  labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
                  height={200}
                  color="#F26A8D"
                  title=""
                />
              </div>
            </div>

            {/* Revenue Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-charcoal">Revenue by Category</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">This Month</span>
                </div>
              </div>
              <div className="h-64">
                <SimpleChart
                  type="pie"
                  data={[45, 25, 20, 10]}
                  labels={['Fabric Sales', 'Tailoring', 'Services', 'Other']}
                  height={200}
                  color="#CDB4DB"
                  title=""
                />
              </div>
            </div>
          </div>

          {/* Top Performers & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Sellers */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">Top Sellers</h3>
                  <button className="text-coralblush hover:text-pink-500 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topSellers.map((seller, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-coralblush to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{seller.name}</p>
                          <p className="text-sm text-gray-600">{seller.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal">{seller.revenue}</p>
                        <div className="flex items-center">
                          <FiStar className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{seller.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Tailors */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">Top Tailors</h3>
                  <button className="text-coralblush hover:text-pink-500 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topTailors.map((tailor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-lilac to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{tailor.name}</p>
                          <p className="text-sm text-gray-600">{tailor.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal">{tailor.earnings}</p>
                        <div className="flex items-center">
                          <FiStar className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{tailor.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">Recent Activity</h3>
                  <button className="text-coralblush hover:text-pink-500 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-charcoal">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Health */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Response Time</span>
                  <span className="font-medium text-blue-600">245ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Sessions</span>
                  <span className="font-medium text-purple-600">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="font-medium text-red-600">0.1%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg hover:from-pink-500 hover:to-coralblush transition-all duration-300">
                  <FiUsers className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Manage Users</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-lilac to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-lilac transition-all duration-300">
                  <FiPackage className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">View Orders</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-champagne to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-champagne transition-all duration-300">
                  <FiAlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Handle Disputes</span>
                </button>
                <button className="p-4 bg-gradient-to-r from-mint to-green-500 text-white rounded-lg hover:from-green-500 hover:to-mint transition-all duration-300">
                  <FiBarChart className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Generate Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminInsights; 