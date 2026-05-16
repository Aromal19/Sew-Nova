import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_DELIVERY_SERVICE_URL || 'http://localhost:3008';
    if (url.endsWith('/')) url = url.slice(0, -1); // Remove trailing slash if present
    if (!url.endsWith('/api')) url += '/api'; // Append /api if missing
    return url;
};

const API_BASE_URL = getBaseUrl();

// Configure axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const deliveryService = {
    // ============================================================
    // LEGACY METHODS (Preserved for compatibility)
    // ============================================================

    // Create delivery record (System triggered usually)
    createDelivery: async (orderId, customerId, bookingType, deliveryAddress) => {
        try {
            const response = await api.post('/deliveries', {
                orderId,
                customerId,
                orderItems: [], // This might need to be populated if used manually
                deliveryAddress
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get delivery details by Order ID
    getDeliveryByOrder: async (orderId) => {
        try {
            const response = await api.get(`/deliveries/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Submit dispatch details (Vendor/Tailor) - LEGACY
    submitDispatchDetails: async (deliveryId, dispatchData) => {
        try {
            const response = await api.post(`/deliveries/${deliveryId}/dispatch`, dispatchData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update vendor dispatch (Legacy name, mapping to new unified endpoint if needed or keeping old)
    updateVendorDispatch: async (deliveryId, dispatchData) => {
        // This maps to the same dispatch endpoint in the refactored legacy controller
        return deliveryService.submitDispatchDetails(deliveryId, dispatchData);
    },

    // Mark as delivered - LEGACY
    markAsDelivered: async (deliveryId) => {
        try {
            const response = await api.post(`/deliveries/${deliveryId}/complete`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get delivery tracking (Customer view) - LEGACY
    getDeliveryTracking: async (orderId) => {
        try {
            const response = await api.get(`/deliveries/tracking/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ============================================================
    // NEW ORDER-DELIVERY METHODS (Strict Lifecycle)
    // ============================================================

    // Get OrderDeliveries by Order ID
    getOrderDeliveries: async (orderId, type = null) => {
        try {
            let url = `/order-deliveries/order/${orderId}`;
            if (type) url += `?type=${type}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Pending Deliveries for Seller/Tailor (List view)
    // type: 'FABRIC' or 'GARMENT'
    getPendingDeliveriesList: async (type, status) => {
        try {
            let url = `/order-deliveries/list?`;
            if (type) url += `type=${type}&`;
            if (status) url += `status=${status}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Dispatch Order (New System)
    dispatchOrderDelivery: async (id, payload) => {
        try {
            // payload: { courierName, trackingId }
            const response = await api.post(`/order-deliveries/${id}/dispatch`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Complete Delivery (New System)
    completeOrderDelivery: async (id) => {
        try {
            const response = await api.post(`/order-deliveries/${id}/complete`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get Combined Tracking (Try New, Fallback to Old)
    getCombinedTracking: async (orderId) => {
        try {
            // Try fetching new system deliveries first
            const newResponse = await api.get(`/order-deliveries/order/${orderId}`);
            if (newResponse.data.success && newResponse.data.deliveries && newResponse.data.deliveries.length > 0) {
                return {
                    success: true,
                    isNewSystem: true,
                    deliveries: newResponse.data.deliveries
                };
            }
            throw new Error("No new deliveries found");
        } catch (err) {
            // Fallback to legacy
            try {
                return await deliveryService.getDeliveryTracking(orderId);
            } catch (legacyErr) {
                return { success: false, message: "Tracking info not available" };
            }
        }
    }
};

export default deliveryService;
