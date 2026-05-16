import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import deliveryService from '../../services/deliveryService';
import { 
  FiTruck, 
  FiPackage, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiMapPin, 
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const DeliveryMonitoring = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    bookingType: '',
    search: ''
  });

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, [currentPage, filters.status, filters.bookingType]);

  const loadDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await deliveryService.getAllDeliveries({
        page: currentPage,
        limit: itemsPerPage,
        status: filters.status,
        bookingType: filters.bookingType
      });

      if (response.success) {
        setDeliveries(response.deliveries);
        setTotalDeliveries(response.totalDeliveries);
      }
    } catch (err) {
      console.error('Error loading deliveries:', err);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, we'd pass the search term to the backend
    // For now, client-side filtering or trigger reload if backend supports search
    loadDeliveries();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
        {status?.replace(/_/g, ' ') || 'Unknown'}
      </span>
    );
  };

  const openDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal flex items-center">
            <FiTruck className="mr-3 text-purple-600" />
            Delivery Monitoring
          </h1>
          <p className="text-gray-600 mt-2">Monitor shipment status across all vendors and tailors</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by Order ID or Customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>

            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              value={filters.bookingType}
              onChange={(e) => setFilters({...filters, bookingType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="tailor">Tailor Only</option>
              <option value="fabric">Fabric Only</option>
              <option value="complete">Complete</option>
            </select>

            <button 
              onClick={loadDeliveries}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Courier</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                      <p>Loading data...</p>
                    </td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>No delivery records found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <tr key={delivery._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-purple-600">
                        #{delivery.orderId?._id?.substring(0, 8).toUpperCase() || delivery.bookingId?._id?.substring(0, 8).toUpperCase() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {delivery.customerId ? (
                          <>
                            <div className="font-medium">{delivery.customerId.name || delivery.customerId.firstname}</div>
                            <div className="text-xs text-gray-500">{delivery.customerId.email}</div>
                          </>
                        ) : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {delivery.deliveryType || delivery.bookingType}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(delivery.status || delivery.overallStatus)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                         {delivery.courierName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-1 w-3 h-3" />
                          {new Date(delivery.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => openDetails(delivery)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && deliveries.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDeliveries)} of {totalDeliveries} results
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= totalDeliveries}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 text-white p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Delivery Details</h2>
                <p className="text-gray-400 text-sm">Order #{selectedDelivery.bookingId?._id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Delivery Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 flex items-center">
                  <FiMapPin className="mr-2" /> Delivery Address
                </h3>
                <div className="text-sm text-gray-600">
                  {selectedDelivery.deliveryAddress ? (
                    <>
                      <p>{selectedDelivery.deliveryAddress.street}</p>
                      <p>{selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state}</p>
                      <p>{selectedDelivery.deliveryAddress.pincode}</p>
                    </>
                  ) : (
                    <p className="italic">No address provided</p>
                  )}
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Shipment Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                      <span>Shipment Details</span>
                      {getStatusBadge(selectedDelivery.status)}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium capitalize">{selectedDelivery.deliveryType}</span>
                      </div>
                      {selectedDelivery.trackingId && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tracking:</span>
                          <span className="font-medium text-blue-600">{selectedDelivery.trackingId}</span>
                        </div>
                      )}
                      {selectedDelivery.courierName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Courier:</span>
                          <span className="font-medium">{selectedDelivery.courierName}</span>
                        </div>
                      )}
                      {selectedDelivery.dispatchedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dispatched:</span>
                          <span className="font-medium">{new Date(selectedDelivery.dispatchedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                       {selectedDelivery.deliveredAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivered:</span>
                          <span className="font-medium text-green-600">{new Date(selectedDelivery.deliveredAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                 {/* Administrative Info */}
                 <div className="border border-gray-200 rounded-lg p-4">
                     <h3 className="font-bold text-gray-800 mb-3">System Details</h3>
                     <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                          <span className="text-gray-500">Locked:</span>
                          <span className={`font-medium ${selectedDelivery.isLocked ? 'text-red-500' : 'text-green-500'}`}>
                              {selectedDelivery.isLocked ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Update:</span>
                          <span className="font-medium">{new Date(selectedDelivery.updatedAt).toLocaleString()}</span>
                        </div>
                        {selectedDelivery.adminOverrides && selectedDelivery.adminOverrides.length > 0 && (
                            <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                <span className="text-yellow-800 text-xs font-bold block mb-1">Admin Interventions:</span>
                                {selectedDelivery.adminOverrides.map((ov, i) => (
                                    <p key={i} className="text-xs text-yellow-700">- {ov.action} ({new Date(ov.timestamp).toLocaleDateString()})</p>
                                ))}
                            </div>
                        )}
                     </div>
                 </div>
              </div>
              
              {/* Timeline */}
              <div>
                 <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Status History</h3>
                 <div className="space-y-3">
                   {selectedDelivery.statusHistory && selectedDelivery.statusHistory.length > 0 ? (
                     selectedDelivery.statusHistory.slice().reverse().map((history, idx) => (
                       <div key={idx} className="flex items-start text-sm">
                         <div className={`mt-1 mr-3 w-2 h-2 rounded-full flex-shrink-0 ${
                             history.status === 'DELIVERED' ? 'bg-green-500' : 
                             history.status === 'DISPATCHED' ? 'bg-blue-500' : 'bg-gray-400'
                         }`}></div>
                         <div>
                           <p className="font-medium text-gray-800 capitalize">
                             {history.status} 
                           </p>
                           <p className="text-xs text-gray-500">{new Date(history.timestamp).toLocaleString()}</p>
                           {history.notes && <p className="text-xs text-gray-600 italic mt-1">"{history.notes}"</p>}
                           {history.updatedBy && <p className="text-xs text-gray-400 mt-0.5">By: {history.updatedBy}</p>}
                         </div>
                       </div>
                     ))
                   ) : (
                     <p className="text-sm text-gray-500 italic">No history available</p>
                   )}
                 </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-b-xl text-right">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMonitoring;
