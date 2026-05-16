import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import deliveryService from '../../services/deliveryService';
import { adminApiService } from '../../services/adminApiService';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiUser, FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';

const OrderDeliveryUpdate = () => {
  const { bookingId } = useParams(); // Using bookingId as OrderId reference
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [booking, setBooking] = useState(null);
  const [delivery, setDelivery] = useState(null);
  
  const [formData, setFormData] = useState({
    courierName: '',
    trackingId: ''
  });

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load Order Details
      try {
          const bookingResponse = await adminApiService.getOrderById(bookingId);
          if (bookingResponse.success) {
            setBooking(bookingResponse.data || bookingResponse.order);
          }
      } catch (e) {
          console.warn("Could not fetch order details, might be legacy booking", e);
      }

      // Load OrderDelivery
      try {
        const deliveriesResp = await deliveryService.getOrderDeliveries(bookingId, 'GARMENT');
        if (deliveriesResp.success && deliveriesResp.deliveries && deliveriesResp.deliveries.length > 0) {
           const garDelivery = deliveriesResp.deliveries[0];
           setDelivery(garDelivery);
           setFormData({
             courierName: garDelivery.courierName || '',
             trackingId: garDelivery.trackingId || ''
           });
        }
      } catch (err) {
        console.log('No OrderDelivery record found:', err);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!delivery) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
        if (delivery.status === 'CREATED') {
            // Dispatch
            const result = await deliveryService.dispatchOrderDelivery(delivery._id, {
                courierName: formData.courierName,
                trackingId: formData.trackingId
            });
            if (result.success) {
                setSuccess("Order Dispatched Successfully!");
                loadData();
            }
        } 
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDelivered = async () => {
      if (!delivery) return;
      if (!window.confirm("Confirm delivery completion?")) return;
      
      setSaving(true);
      try {
          const result = await deliveryService.completeOrderDelivery(delivery._id);
          if (result.success) {
              setSuccess("Order Marked as Delivered!");
              loadData();
          }
      } catch (err) {
          setError(err.message || 'Failed to complete');
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="tailor" />
        <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="tailor" />
      
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="mb-6">
          <button onClick={() => navigate('/tailor/active-orders')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          
          <h1 className="text-3xl font-bold text-charcoal">Update Delivery Status</h1>
          <p className="text-gray-600 mt-2">Order #{bookingId?.substring(0, 8)}</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center"><FiAlertCircle className="mr-2"/> {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center"><FiCheckCircle className="mr-2"/> {success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit">
              <h2 className="text-xl font-bold mb-4 flex items-center"><FiPackage className="mr-2 text-purple-500"/> Order Info</h2>
              {booking && (
                  <div className="space-y-3 text-sm">
                      <div>
                          <p className="text-gray-500">Customer</p>
                          <p className="font-semibold">{booking.customerId?.firstname} {booking.customerId?.lastname}</p>
                      </div>
                      <div>
                          <p className="text-gray-500">Address</p>
                          <p>{booking.deliveryAddress?.city}, {booking.deliveryAddress?.state}</p>
                      </div>
                  </div>
              )}
              
              <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-500 mb-2">Current Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      delivery?.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      delivery?.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                      {delivery?.status || 'Pending'}
                  </span>
              </div>
          </div>

          {/* Action Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center"><FiTruck className="mr-2 text-purple-500"/> Update Status</h2>
              
              {!delivery ? (
                  <p className="text-gray-500 italic">No delivery record found. This might be a pending order or legacy booking.</p>
              ) : (
                  <>
                      {delivery.status === 'CREATED' && (
                          <form onSubmit={handleSubmit} className="space-y-6">
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                  <h3 className="font-semibold text-blue-800 mb-4">Dispatch Details</h3>
                                  <div className="space-y-4">
                                      <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
                                          <input 
                                              required
                                              name="courierName"
                                              value={formData.courierName}
                                              onChange={handleInputChange}
                                              className="w-full border rounded px-3 py-2"
                                              placeholder="e.g. FedEx"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                                          <input 
                                              required
                                              name="trackingId"
                                              value={formData.trackingId}
                                              onChange={handleInputChange}
                                              className="w-full border rounded px-3 py-2"
                                              placeholder="Tracking Number"
                                          />
                                      </div>
                                  </div>
                              </div>
                              <button type="submit" disabled={saving} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors">
                                  {saving ? 'Processing...' : 'Confirm Dispatch'}
                              </button>
                          </form>
                      )}

                      {delivery.status === 'DISPATCHED' && (
                          <div className="space-y-6">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-600">Dispatched via <strong>{delivery.courierName}</strong></p>
                                  <p className="text-sm text-gray-600">Tracking: <strong>{delivery.trackingId}</strong></p>
                              </div>
                              <button onClick={handleMarkDelivered} disabled={saving} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex justify-center items-center">
                                  <FiCheckCircle className="mr-2"/> Mark as Delivered
                              </button>
                          </div>
                      )}

                      {delivery.status === 'DELIVERED' && (
                          <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg">
                              <FiCheckCircle className="w-12 h-12 mx-auto mb-2"/>
                              <p className="font-bold text-lg">Order Delivered</p>
                              <p className="text-sm">{new Date(delivery.deliveredAt).toLocaleString()}</p>
                          </div>
                      )}
                  </>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDeliveryUpdate;
