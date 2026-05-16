import React, { useState } from "react";
import { FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2, FiUserPlus, FiUserMinus } from "react-icons/fi";

const AdminUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "customer",
      status: "active",
      joinDate: "2024-01-20",
      lastActive: "2 hours ago",
      totalOrders: 5
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "tailor",
      status: "active",
      joinDate: "2024-01-19",
      lastActive: "1 hour ago",
      totalOrders: 25
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "seller",
      status: "active",
      joinDate: "2024-01-18",
      lastActive: "3 hours ago",
      totalOrders: 12
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "customer",
      status: "inactive",
      joinDate: "2024-01-15",
      lastActive: "1 day ago",
      totalOrders: 2
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "customer": return "bg-blue-100 text-blue-800";
      case "tailor": return "bg-purple-100 text-purple-800";
      case "seller": return "bg-green-100 text-green-800";
      case "admin": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="tailor">Tailors</option>
              <option value="seller">Sellers</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300 flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-coralblush to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.lastActive}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{user.joinDate}</td>
                  <td className="py-3 px-4 text-gray-700">{user.totalOrders}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="View">
                        <FiEye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Edit">
                        <FiEdit className="w-4 h-4 text-gray-600" />
                      </button>
                      {user.status === 'active' ? (
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Suspend">
                          <FiUserMinus className="w-4 h-4 text-red-600" />
                        </button>
                      ) : (
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Activate">
                          <FiUserPlus className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Delete">
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;
