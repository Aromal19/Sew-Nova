  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import Sidebar from "../../components/Sidebar";
import { adminApiService } from "../../services/adminApiService";
import { getCurrentUser } from "../../utils/api";
  import { 
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
    FiPackage, 
  FiUser,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
    FiClock,
    FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
    FiTrendingUp,
  FiTrendingDown,
  FiMenu
  } from "react-icons/fi";

  const CustomerBookings = () => {
    const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  
  // Statistics
  const [statistics, setStatistics] = useState(null);
  
  // Selected order for details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Current user
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      loadOrders();
      loadStatistics();
    }
    }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentPage, statusFilter, sortBy, sortOrder, currentUser]);

  const loadOrders = async () => {
    if (!currentUser?.email) return;
    
        setLoading(true);
    setError(null);
    
    try {
      const response = await adminApiService.getAllOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
        search: currentUser.email // Filter by current user's email
      });
      
      if (response.success) {
        setOrders(response.data.bookings || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalBookings(response.data.pagination?.totalBookings || 0);
      } else {
        setError(response.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  const loadStatistics = async () => {
    if (!currentUser?.email) return;
    
    try {
      const response = await adminApiService.getOrderStatistics();
      if (response.success) {
        // Filter statistics to only show current user's data
        const userStats = {
          ...response.data,
          totalBookings: response.data.bookingsByEmail?.[currentUser.email] || 0,
          totalRevenue: response.data.revenueByEmail?.[currentUser.email] || 0,
          bookingsByStatus: response.data.bookingsByStatus || {}
        };
        setStatistics(userStats);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderDetails?.garmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderDetails?.designDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
    };

    const getStatusColor = (status) => {
      switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "ready_for_fitting": return "bg-indigo-100 text-indigo-800";
      case "completed": return "bg-green-100 text-green-800";
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
      case "pending": return FiClock;
      case "confirmed": return FiCheckCircle;
      case "in_progress": return FiRefreshCw;
      case "ready_for_fitting": return FiPackage;
      case "completed": return FiCheckCircle;
      case "delivered": return FiCheckCircle;
      case "cancelled": return FiX;
      default: return FiClock;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };


    return (
    <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="bookings" />

        {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="p-6">
          {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FiMenu className="w-5 h-5 text-gray-600" />
              </button>
                <div>
                <h1 className="text-3xl font-bold text-charcoal">My Orders</h1>
                <p className="text-gray-600 mt-2">Track and manage your orders and bookings.</p>
              </div>
                </div>
            <div className="flex items-center space-x-4">
                  <button
                onClick={loadOrders}
                className="flex items-center px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                <FiRefreshCw className="mr-2" />
                    Refresh
                  </button>
                  <button
                onClick={() => navigate('/customer/landing')}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all duration-200"
                  >
                Back to Dashboard
                  </button>
                </div>
              </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-charcoal">{statistics.totalBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-coralblush to-pink-500 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-6 h-6 text-white" />
                </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-charcoal">{formatCurrency(statistics.totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-champagne to-yellow-500 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-charcoal" />
                  </div>
                  </div>
                </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold text-charcoal">{statistics.bookingsByStatus?.pending || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                            <div>
                    <p className="text-gray-600 text-sm font-medium">Completed Orders</p>
                    <p className="text-2xl font-bold text-charcoal">{statistics.bookingsByStatus?.completed || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
            </div>
          )}
        </header>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, garment type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                />
                          </div>
                        </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="ready_for_fitting">Ready for Fitting</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="totalAmount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'desc' ? <FiTrendingDown className="w-4 h-4" /> : <FiTrendingUp className="w-4 h-4" />}
            </button>
                            </div>
                          </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-charcoal">My Orders ({totalBookings})</h3>
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalBookings)} of {totalBookings} orders
                              </div>
                            </div>
                          </div>

          {loading ? (
            <div className="p-8 text-center">
              <FiRefreshCw className="w-8 h-8 text-coralblush animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading orders...</p>
                              </div>
          ) : error ? (
            <div className="p-8 text-center">
              <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadOrders}
                className="mt-4 px-4 py-2 bg-coralblush text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Try Again
              </button>
                                </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((booking) => {
                    const StatusIcon = getStatusIcon(booking.status);
                    return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-charcoal">{booking.bookingType}</div>
                            <div className="text-sm text-gray-500">ID: {booking._id.slice(-8)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-charcoal">{booking.orderDetails?.garmentType || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Qty: {booking.orderDetails?.quantity || 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-charcoal">{formatCurrency(booking.pricing?.totalAmount || 0)}</div>
                          <div className="text-sm text-gray-500">{booking.payment?.status || 'pending'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(booking);
                                setShowOrderModal(true);
                              }}
                              className="text-coralblush hover:text-pink-600 transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
                          )}
                        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-coralblush text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-coralblush text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                  )}
                </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FiChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
        </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">Order Details</h3>
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      setSelectedOrder(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Order ID:</span> {selectedOrder._id}</div>
                      <div><span className="font-medium">Booking Type:</span> {selectedOrder.bookingType}</div>
                      <div><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div><span className="font-medium">Payment Status:</span> {selectedOrder.payment?.status || 'pending'}</div>
                      <div><span className="font-medium">Total Amount:</span> {formatCurrency(selectedOrder.pricing?.totalAmount || 0)}</div>
                      <div><span className="font-medium">Created:</span> {formatDate(selectedOrder.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Order Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Garment Type:</span> {selectedOrder.orderDetails?.garmentType || 'N/A'}</div>
                      <div><span className="font-medium">Quantity:</span> {selectedOrder.orderDetails?.quantity || 1}</div>
                      <div><span className="font-medium">Delivery Date:</span> {selectedOrder.orderDetails?.deliveryDate ? formatDate(selectedOrder.orderDetails.deliveryDate) : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="font-medium text-charcoal mb-2">Order Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{selectedOrder.orderDetails?.garmentType || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{selectedOrder.orderDetails?.designDescription || 'No description'}</div>
                        {selectedOrder.orderDetails?.specialInstructions && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Special Instructions:</span> {selectedOrder.orderDetails.specialInstructions}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(selectedOrder.pricing?.totalAmount || 0)}</div>
                        <div className="text-sm text-gray-600">Qty: {selectedOrder.orderDetails?.quantity || 1}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
    );
  };

  export default CustomerBookings; 