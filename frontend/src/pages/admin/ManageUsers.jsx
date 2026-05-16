import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  FiUsers, 
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiLoader,
  FiLogOut,
  FiFilter
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../utils/api";
import { adminService, fetchUsersFromServices } from "../../services/adminService";

const ManageUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // User management states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      loadUsers();
    }
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load users data
      const usersData = await fetchUsersFromServices();
      if (usersData.success) {
        setUsers(usersData.data.users);
      } else {
        // Fallback to admin service if direct service calls fail
        const adminUsersData = await adminService.getAllUsers({
          page: 1,
          limit: 100
        });
        if (adminUsersData.success) {
          setUsers(adminUsersData.data.users);
        }
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
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
                <h1 className="text-3xl font-bold text-charcoal">Manage Users</h1>
                <p className="text-gray-600 mt-2">View and manage all platform users including customers, tailors, and sellers.</p>
              </div>
              <div className="flex items-center space-x-4">
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
          </header>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* User Management Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-charcoal">User Management</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="tailor">Tailors</option>
                    <option value="seller">Sellers</option>
                  </select>
                  <button className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300">
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <FiLoader className="w-8 h-8 text-coralblush animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            )}

            {/* Users Table */}
            {!loading && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id || user._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-charcoal">
                              {user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-gray-700">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                                {user.status || 'active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {user.joinDate || user.createdAt || 'Unknown'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="View User"
                                >
                                  <FiEye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit User"
                                >
                                  <FiEdit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleUserAction('delete', user.id || user._id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Delete User"
                                >
                                  <FiTrash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Separate Role Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal">Customers</h3>
                <p className="text-sm text-gray-600">
                  {filteredUsers.filter(u => u.role === 'customer').length} customers
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.role === 'customer')
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id || user._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-charcoal">
                            {user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                          {user.status || 'active'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Tailors Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal">Tailors</h3>
                <p className="text-sm text-gray-600">
                  {filteredUsers.filter(u => u.role === 'tailor').length} tailors
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.role === 'tailor')
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id || user._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-charcoal">
                            {user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                          {user.status || 'active'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sellers Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-charcoal">Sellers</h3>
                <p className="text-sm text-gray-600">
                  {filteredUsers.filter(u => u.role === 'seller').length} sellers
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.role === 'seller')
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id || user._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-charcoal">
                            {user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                          {user.status || 'active'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
