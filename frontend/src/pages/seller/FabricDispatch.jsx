import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import deliveryService from '../../services/deliveryService';
import { adminApiService } from '../../services/adminApiService'; // Keeping for potential detailed order fetch if needed
import { FiPackage, FiTruck, FiCheckCircle, FiSearch, FiEdit, FiClock } from 'react-icons/fi';

const FabricDispatch = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [dispatchForm, setDispatchForm] = useState({
    courierName: '',
    trackingId: '',
    notes: '' // Not in new model but can be kept for local UI state or ignored
  });

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchTerm, statusFilter]);

  // Helper to get current user details
  const getCurrentUser = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      console.log('👤 Current User (Vendor):', currentUser);
      
      if (!currentUser) {
          console.error('❌ User details could not be parsed from token');
      }

      // 1. Fetch all confirmed orders via Admin API
      console.log('🔄 Fetching confirmed orders from Admin API...');
      const response = await adminApiService.getAllOrders({ 
          status: 'Confirmed',
          limit: 100
      });

      // Handle response structure
      const bookings = response.data?.bookings || response.bookings || response.data || [];
      console.log(`📦 Raw Bookings Fetched: ${bookings.length}`);

      if (!bookings || bookings.length === 0) {
          console.warn('⚠️ No "Confirmed" bookings returned from API');
          setDeliveries([]);
          return;
      }

      // 2. Filter for this Seller's Key Orders
      const myBookings = bookings.filter(b => {
          // Debugging log for each booking
          const isTailor = b.bookingType === 'tailor';
          const hasFabricDetails = !!b.fabricDetails;
          const sellerID = b.fabricDetails?.sellerId;
          const currentUserID = currentUser?.id || currentUser?._id; // Handle both formats
          
          //Robust comparison: Convert both to string if they exist
          const isSellerMatch = sellerID && currentUserID && String(sellerID) === String(currentUserID);

          // Log potential candidates that are being rejected
          if (!isTailor && hasFabricDetails && !isSellerMatch) {
               console.log(`⚠️ REJECTED Booking ${b._id} (Fabric: ${b.fabricDetails.name}): SellerID (${sellerID}) !== CurrentUser (${currentUserID})`);
          }

          return !isTailor && hasFabricDetails && isSellerMatch;
      });

      console.log(`✅ Filtered Bookings for Vendor: ${myBookings.length}`);

      const fabricDeliveries = [];

      // 3. Resolve delivery status for each order
      await Promise.all(myBookings.map(async (order) => {
          try {
              const dlResponse = await deliveryService.getOrderDeliveries(order._id, 'FABRIC');
              
              if (dlResponse.success && dlResponse.deliveries) {
                  const fDeliveries = Array.isArray(dlResponse.deliveries) 
                      ? dlResponse.deliveries.filter(d => d.deliveryType === 'FABRIC') 
                      : (dlResponse.deliveries?.deliveryType === 'FABRIC' ? [dlResponse.deliveries] : []);
                  
                  // Only add if we found delivery records
                  if (fDeliveries.length > 0) {
                      fabricDeliveries.push(...fDeliveries);
                  } else {
                      // OPTIONAL: If we want to show pending orders that don't have delivery records yet
                      // We would need to construct a "fake" delivery object here or handle it in UI
                      // For now, adhering to flow where system creates it.
                      console.log(`ℹ️ Order ${order._id} has no FABRIC delivery record yet.`);
                  }
              }
          } catch (err) {
               // console.warn(`No delivery record for order ${order._id}`, err);
          }
      }));

      // Sort by creation date desc
      fabricDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`🚚 Final Displayable Deliveries: ${fabricDeliveries.length}`);
      setDeliveries(fabricDeliveries);

    } catch (err) {
      console.error('❌ Error loading fabric deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.orderId.substring(0, 8).toLowerCase().includes(term) || // Simple check on ID
        (d.courierName && d.courierName.toLowerCase().includes(term)) ||
        (d.trackingId && d.trackingId.toLowerCase().includes(term))
      );
    }

    setFilteredDeliveries(filtered);
  };

  const openDispatchModal = (delivery) => {
    setSelectedDelivery(delivery);
    // If already dispatched, show details (readonly or for marking delivered)
    setDispatchForm({
      courierName: delivery.courierName || '',
      trackingId: delivery.trackingId || '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    try {
      // If status is CREATED -> Dispatch
      if (selectedDelivery.status === 'CREATED') {
          const result = await deliveryService.dispatchOrderDelivery(selectedDelivery._id, {
              courierName: dispatchForm.courierName,
              trackingId: dispatchForm.trackingId
          });
          if (result.success) {
              alert('Order dispatched successfully');
              setShowModal(false);
              loadDeliveries(); // Refresh
          }
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
      alert(err.message || 'Failed to dispatch');
    }
  };

  const handleMarkDelivered = async () => {
      if (!selectedDelivery) return;
      if (!window.confirm('Are you sure you want to mark this as DELIVERED? This cannot be undone.')) return;

      try {
          const result = await deliveryService.completeOrderDelivery(selectedDelivery._id);
          if (result.success) {
              alert('Order marked as delivered');
              setShowModal(false);
              loadDeliveries();
          }
      } catch (err) {
          console.error('Completion failed:', err);
          alert(err.message || 'Failed to complete delivery');
      }
  };

  const getStatusBadge = (status) => {
    const config = {
      CREATED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Dispatch' },
      DISPATCHED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Transit' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' }
    };
    
    const style = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="seller" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="seller" />
      
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Fabric Dispatch Management</h1>
          <p className="text-gray-600 mt-2">Manage fabric shipments to tailors (New System)</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID or Tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="CREATED">Pending</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
            </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Order Ref</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tracking</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Updated</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-purple-600">
                      #{delivery.orderId.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(delivery.status)}
                  </td>
                  <td className="px-6 py-4">
                    {delivery.trackingId ? (
                         <div>
                             <p className="text-sm font-medium">{delivery.courierName}</p>
                             <p className="text-xs text-gray-500">{delivery.trackingId}</p>
                         </div>
                    ) : <span className="text-gray-400 text-sm">-</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(delivery.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openDispatchModal(delivery)}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && (
                  <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                          No fabric deliveries found matching criteria.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-800">Manage Delivery</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              
              <div className="p-6">
                  <div className="mb-6 flex items-center space-x-3 text-sm">
                      <span className="text-gray-500">Status:</span>
                      {getStatusBadge(selectedDelivery.status)}
                  </div>

                  {selectedDelivery.status === 'CREATED' && (
                      <form onSubmit={handleDispatchSubmit} className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
                              <input 
                                  required
                                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                  placeholder="e.g. BlueDart"
                                  value={dispatchForm.courierName}
                                  onChange={e => setDispatchForm({...dispatchForm, courierName: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                              <input 
                                  required
                                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                  placeholder="e.g. 123456789"
                                  value={dispatchForm.trackingId}
                                  onChange={e => setDispatchForm({...dispatchForm, trackingId: e.target.value})}
                              />
                          </div>
                          <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                              Confirm Dispatch
                          </button>
                      </form>
                  )}

                  {selectedDelivery.status === 'DISPATCHED' && (
                      <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                              <p><strong>Courier:</strong> {selectedDelivery.courierName}</p>
                              <p><strong>Tracking:</strong> {selectedDelivery.trackingId}</p>
                              <p className="mt-2 text-xs">Dispatched on {new Date(selectedDelivery.dispatchedAt).toLocaleString()}</p>
                          </div>
                          
                          <button 
                              onClick={handleMarkDelivered}
                              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                              <FiCheckCircle /> Mark as Delivered
                          </button>
                      </div>
                  )}

                  {selectedDelivery.status === 'DELIVERED' && (
                      <div className="bg-green-50 p-4 rounded-lg text-green-800 text-center">
                          <FiCheckCircle className="mx-auto h-8 w-8 mb-2" />
                          <p className="font-semibold">Delivery Complete</p>
                          <p className="text-sm">Delivered on {new Date(selectedDelivery.deliveredAt).toLocaleString()}</p>
                      </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FabricDispatch;

