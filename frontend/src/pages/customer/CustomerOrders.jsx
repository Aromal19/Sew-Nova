import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { customerAPI } from "../../utils/bookingApi";
import deliveryService from "../../services/deliveryService"; 
import { adminApiService } from "../../services/adminApiService"; 
import { getCurrentUser } from "../../utils/api"; 
import { 
  FiPackage, 
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiShoppingBag,
  FiScissors,
  FiEye,
  FiRefreshCw,
  FiMenu,
  FiTrendingUp,
  FiTrendingDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiDownload,
  FiAlertCircle
} from "react-icons/fi";

const CustomerOrders = () => {
  const navigate = useNavigate();
  // Sidebar state consistent with Bookings
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Added user state
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState('cards');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Matches Bookings closely (usually 10, but 9 fits grid 3x3)
  const [totalPages, setTotalPages] = useState(1); // Added total pages state
  const [totalOrders, setTotalOrders] = useState(0); // Added total orders state

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
        fetchOrders(user);
    }
  }, []);

  // Effect to re-fetch when filters change (server-side filtering preference)
  useEffect(() => {
    if (currentUser) {
        fetchOrders(currentUser);
    }
  }, [currentPage, filterStatus, sortBy, sortOrder, currentUser]); 

  const fetchOrders = async (user = currentUser) => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Use adminApiService to match CustomerBookings logic
      const response = await adminApiService.getAllOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        sortBy,
        sortOrder,
        search: user.email // Filter by current user's email acting as search
      });

      if (response.success) {
        setOrders(response.data.bookings || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalBookings || 0);
      } else {
        console.error("Failed to fetch orders:", response.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (order) => {
    if (order.status === 'pending' || order.status === 'cancelled') {
        alert('Tracking is only available for confirmed orders.');
        return;
    }
    navigate(`/customer/tracking?orderId=${order._id}`);
  };

  // Filter and Sort Logic (Client-side refinement)
  const getFilteredOrders = () => {
    // If the API already filtered by email and status, we refine by local search string and type
    let filtered = orders.filter(order => {
      // Local search (API 'search' was used for email)
      const matchesSearch = searchQuery === "" ||
        (order.orderDetails?.garmentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.tailorDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.fabricDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status is filtered by API if not 'all', but double check for robustness
      const matchesStatus = filterStatus === "all" || order.status === filterStatus; 

      const matchesType = filterType === "all" || order.bookingType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Client-side sort if API sort isn't sufficient or if re-sorting filtered results
    return filtered.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'totalAmount':
          valA = a.pricing?.totalAmount || 0;
          valB = b.pricing?.totalAmount || 0;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'createdAt':
        default:
          valA = new Date(a.timeline?.bookingDate || a.createdAt).getTime();
          valB = new Date(b.timeline?.bookingDate || b.createdAt).getTime();
          break;
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  };

  const filteredOrders = getFilteredOrders();
  // Note: Pagination is now Hybrid. API limits to 'itemsPerPage', but we are filtering further on client. 
  // Ideally, all filters should be server-side. For now, we display the filtered results of the *current page*.
  // If the user wants full search across all pages, the API needs 'searchQuery' separate from 'userEmail'.
  // We will assume for this step that the user accepts this current-page filtering or that the admin API 'search' can handle generic queries later.
  const currentOrders = filteredOrders; // Display all filtered ones from the fetched batch

  // Helpers
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

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "tailor": return <FiScissors className="w-5 h-5" />;
      case "fabric": return <FiShoppingBag className="w-5 h-5" />;
      case "complete": return <FiPackage className="w-5 h-5" />;
      default: return <FiPackage className="w-5 h-5" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatPrice = (price) => `₹${price?.toLocaleString('en-IN') || 0}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="orders" />

      <div className={`flex-1 transition-all duration-300`}>
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
                  <p className="text-gray-600 mt-2">Track and manage your orders.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2 hidden md:flex">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                        Cards
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                        Table
                    </button>
                </div>
                <button
                  onClick={fetchOrders}
                  className="flex items-center px-4 py-2 bg-coralblush hover:bg-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <FiRefreshCw className="mr-2" /> Refresh
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-charcoal">{orders.length}</p>
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
                    <p className="text-2xl font-bold text-charcoal">
                        {formatPrice(orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0))}
                    </p>
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
                    <p className="text-2xl font-bold text-charcoal">
                        {orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-charcoal">
                        {orders.filter(o => o.status === 'completed' || o.status === 'delivered').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="tailor">Tailor</option>
                <option value="fabric">Fabric</option>
                <option value="complete">Complete</option>
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
                {sortOrder === 'desc' ? <FiTrendingDown /> : <FiTrendingUp />}
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-8 text-center">
                <FiRefreshCw className="w-8 h-8 text-coralblush animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100">
                <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View - Keeping for completeness but cleaner style */
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => {
                         const StatusIcon = getStatusIcon(order.status);
                         return (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-charcoal capitalize">{order.bookingType}</div>
                                    <div className="text-xs text-gray-500">#{order._id.slice(-8)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 capitalize">{order.orderDetails?.garmentType}</div>
                                    <div className="text-xs text-gray-500">Qty: {order.orderDetails?.quantity}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {formatPrice(order.pricing?.totalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }} className="text-coralblush hover:text-pink-600 mr-3"><FiEye /></button>
                                    {order.status !== 'pending' && <button onClick={() => handleTrackOrder(order)} className="text-indigo-600 hover:text-indigo-900"><FiMapPin /></button>}
                                </td>
                            </tr>
                         )
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
          ) : (
            /* Card View - Enhanced */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                        <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${order.bookingType === 'tailor' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                        {getOrderTypeIcon(order.bookingType)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-charcoal capitalize">{order.bookingType} Order</h3>
                                        <p className="text-xs text-gray-500">ID: #{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 space-y-4">
                                {/* Garment Info */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Garment</p>
                                        <p className="font-medium text-gray-900 capitalize">{order.orderDetails?.garmentType || 'N/A'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Qty: {order.orderDetails?.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                                        <p className="font-bold text-gray-900">{formatPrice(order.pricing?.totalAmount)}</p>
                                        <p className={`text-xs ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                                            {order.payment?.status === 'paid' ? 'Paid' : 'Pending'}
                                        </p>
                                    </div>
                                </div>

                                {/* Detail Blocks */}
                                <div className="space-y-3">
                                    {order.tailorDetails && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiScissors className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">{order.tailorDetails.name}</span>
                                        </div>
                                    )}
                                    {order.fabricDetails && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">{order.fabricDetails.name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-400 transition-colors"
                                >
                                    <FiEye className="mr-2" /> Details
                                </button>
                                {order.status !== 'pending' && order.status !== 'cancelled' ? (
                                    <button 
                                        onClick={() => handleTrackOrder(order)}
                                        className="flex items-center justify-center px-4 py-2 bg-coralblush text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
                                    >
                                        <FiMapPin className="mr-2" /> Track
                                    </button>
                                ) : (
                                    <button disabled className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                                        <FiClock className="mr-2" /> Track
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        <FiChevronLeft />
                    </button>
                    <span className="text-sm text-gray-600 px-4">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        <FiChevronRight />
                    </button>
                </nav>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal (Preserved) */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
               <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                 <h3 className="text-xl font-bold text-charcoal">Order Details</h3>
                 <button onClick={() => setShowOrderDetails(false)} className="text-gray-400 hover:text-gray-600">
                   <FiX className="w-6 h-6" />
                 </button>
               </div>
               <div className="p-6 space-y-6">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <h4 className="font-medium text-gray-500 uppercase text-xs tracking-wide mb-3">Order Info</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Order ID:</span> <span className="font-medium text-gray-900">#{selectedOrder._id}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Date:</span> <span className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
                     </div>
                   </div>
                   <div>
                     <h4 className="font-medium text-gray-500 uppercase text-xs tracking-wide mb-3">Payment Info</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Total Amount:</span> <span className="font-bold text-gray-900">{formatPrice(selectedOrder.pricing?.totalAmount)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Advance Paid:</span> <span className="font-medium text-green-600">{formatPrice(selectedOrder.pricing?.advanceAmount)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Payment Status:</span> <span className={`font-medium ${selectedOrder.payment?.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>{selectedOrder.payment?.status || 'Pending'}</span></div>
                     </div>
                   </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-medium text-gray-500 uppercase text-xs tracking-wide mb-3">Item Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-900">{selectedOrder.orderDetails?.garmentType}</p>
                                <p className="text-sm text-gray-600 mt-1">{selectedOrder.orderDetails?.designDescription}</p>
                                {selectedOrder.orderDetails?.specialInstructions && <p className="text-xs text-gray-500 mt-2">Note: {selectedOrder.orderDetails.specialInstructions}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">Qty: {selectedOrder.orderDetails?.quantity}</p>
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
               <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                   <button onClick={() => setShowOrderDetails(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">Close</button>
               </div>
             </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTrackingModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTruck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                        Order Tracking #{selectedOrder?._id.slice(-6)}
                    </h3>
                    <div className="mt-4">
                      {loadingTracking ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                      ) : trackingError ? (
                        <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm flex items-center"><FiAlertCircle className="mr-2"/>{trackingError}</div>
                      ) : !trackingData ? (
                        <div className="text-center py-8 text-gray-500"><p>Tracking information is preparing...</p></div>
                      ) : (
                        <div className="space-y-6">
                            {/* Status Card */}
                          <div className={`p-4 rounded-lg flex justify-between items-center ${
                              trackingData.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 
                              trackingData.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700' : 
                              trackingData.status === 'PREPARING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'
                          }`}>
                              <div>
                                <p className="text-xs uppercase tracking-wide opacity-75">Current Status</p>
                                <p className="text-lg font-bold capitalize">{trackingData.status}</p>
                              </div>
                              <FiPackage className="w-8 h-8 opacity-20" />
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                  <p className="text-gray-500 text-xs">Courier</p>
                                  <p className="font-medium text-charcoal">{trackingData.courierName || 'Pending'}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Tracking ID</p>
                                  <p className="font-medium text-charcoal">{trackingData.trackingId || 'Pending'}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Dispatched</p>
                                  <p className="font-medium text-charcoal">{trackingData.dispatchedAt ? new Date(trackingData.dispatchedAt).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Delivered</p>
                                  <p className="font-medium text-charcoal">{trackingData.deliveredAt ? new Date(trackingData.deliveredAt).toLocaleDateString() : '-'}</p>
                              </div>
                          </div>

                          {/* Timeline */}
                          {trackingData.timeline && trackingData.timeline.length > 0 && (
                              <div className="border-t border-gray-100 pt-4">
                                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                      <FiClock className="mr-2 text-indigo-500"/> Timeline
                                  </h4>
                                  <ul className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      {trackingData.timeline.map((event, i) => (
                                          <li key={i} className="flex gap-3 relative">
                                              <div className="mt-1 relative z-10">
                                                  <FiCheckCircle className="text-indigo-600 w-4 h-4" />
                                                  {i !== trackingData.timeline.length - 1 && <div className="absolute top-4 left-2 w-0.5 h-full bg-gray-200 -z-10"></div>}
                                              </div>
                                              <div>
                                                  <p className="text-sm font-medium capitalize text-charcoal">{event.status}</p>
                                                  <p className="text-xs text-gray-500">
                                                      {new Date(event.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                  </p>
                                                  {event.notes && <p className="text-xs text-gray-400 mt-0.5">{event.notes}</p>}
                                              </div>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm" 
                  onClick={() => setShowTrackingModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => { setShowTrackingModal(false); navigate(`/customer/tracking?orderId=${selectedOrder._id}`); }}
                >
                  Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerOrders;
