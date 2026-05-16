import { apiCall } from '../config/api';

// Admin Service API calls
export const adminService = {
  // Fetch all users from different services
  async getAllUsers(params = {}) {
    try {
      const { page = 1, limit = 10, role, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role }),
        ...(search && { search })
      });

      return await apiCall('ADMIN_SERVICE', `/api/users?${queryParams}`);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Fetch users by role from auth service
  async getUsersByRole(role, params = {}) {
    try {
      const { page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      // For now, we'll use the admin service which aggregates users
      // In a real implementation, you might want to call individual services
      return await apiCall('ADMIN_SERVICE', `/api/users?role=${role}&${queryParams}`);
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      throw error;
    }
  },

  // Fetch analytics data
  async getAnalytics(period = '30d') {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/analytics?period=${period}`);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Fetch revenue analytics
  async getRevenueAnalytics(period = '30d') {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/analytics/revenue?period=${period}`);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  // Fetch user analytics
  async getUserAnalytics(period = '30d') {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/analytics/users?period=${period}`);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/users/${userId}`);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Fetch designs
  async getDesigns(params = {}) {
    try {
      const { page = 1, limit = 10, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      return await apiCall('ADMIN_SERVICE', `/api/designs?${queryParams}`);
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw error;
    }
  },

  // Get design statistics
  async getDesignStats() {
    try {
      return await apiCall('ADMIN_SERVICE', '/api/designs/stats');
    } catch (error) {
      console.error('Error fetching design stats:', error);
      throw error;
    }
  },

  // Create new design
  async createDesign(designData) {
    try {
      return await apiCall('ADMIN_SERVICE', '/api/designs', {
        method: 'POST',
        body: JSON.stringify(designData)
      });
    } catch (error) {
      console.error('Error creating design:', error);
      throw error;
    }
  },

  // Update design
  async updateDesign(designId, designData) {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/designs/${designId}`, {
        method: 'PUT',
        body: JSON.stringify(designData)
      });
    } catch (error) {
      console.error('Error updating design:', error);
      throw error;
    }
  },

  // Delete design
  async deleteDesign(designId) {
    try {
      return await apiCall('ADMIN_SERVICE', `/api/designs/${designId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting design:', error);
      throw error;
    }
  },

  // Get design categories
  async getDesignCategories() {
    try {
      return await apiCall('ADMIN_SERVICE', '/api/designs/categories');
    } catch (error) {
      console.error('Error fetching design categories:', error);
      throw error;
    }
  }
};

// Helper function to fetch users from individual services
export const fetchUsersFromServices = async () => {
  try {
    const [customers, tailors, sellers] = await Promise.allSettled([
      // Fetch customers from auth service
      apiCall('AUTH_SERVICE', '/api/customers/all'),
      // Fetch tailors from auth service  
      apiCall('AUTH_SERVICE', '/api/tailors/all'),
      // Fetch sellers from auth service
      apiCall('AUTH_SERVICE', '/api/sellers/all')
    ]);

    const allUsers = [];
    
    // Debug: Log the responses
    console.log('Customers response:', customers);
    console.log('Tailors response:', tailors);
    console.log('Sellers response:', sellers);
    
    // Log any errors
    if (customers.status === 'rejected') {
      console.error('Customers fetch failed:', customers.reason);
    }
    if (tailors.status === 'rejected') {
      console.error('Tailors fetch failed:', tailors.reason);
    }
    if (sellers.status === 'rejected') {
      console.error('Sellers fetch failed:', sellers.reason);
    }
    
    // Process customers
    if (customers.status === 'fulfilled' && customers.value?.customers) {
      const customerUsers = customers.value.customers.map(user => ({
        ...user,
        role: 'customer',
        joinDate: user.createdAt || user.joinDate,
        lastActive: user.lastLogin || user.lastActive
      }));
      allUsers.push(...customerUsers);
    }

    // Process tailors
    if (tailors.status === 'fulfilled' && tailors.value?.tailors) {
      const tailorUsers = tailors.value.tailors.map(user => ({
        ...user,
        role: 'tailor',
        joinDate: user.createdAt || user.joinDate,
        lastActive: user.lastLogin || user.lastActive
      }));
      allUsers.push(...tailorUsers);
    }

    // Process sellers
    if (sellers.status === 'fulfilled' && sellers.value?.sellers) {
      const sellerUsers = sellers.value.sellers.map(user => ({
        ...user,
        role: 'seller',
        joinDate: user.createdAt || user.joinDate,
        lastActive: user.lastLogin || user.lastActive
      }));
      allUsers.push(...sellerUsers);
    }

    // If no users found, return empty array
    if (allUsers.length === 0) {
      console.log('No users found from API calls');
    }

    return {
      success: true,
      data: {
        users: allUsers,
        totalUsers: allUsers.length
      }
    };
  } catch (error) {
    console.error('Error fetching users from services:', error);
    return {
      success: false,
      data: { users: [], totalUsers: 0 },
      error: error.message
    };
  }
};

export default adminService;
