import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2, FiPackage, FiUser, FiCalendar, FiTrendingUp, FiClock, FiAlertCircle } from "react-icons/fi";

const TailorOrdersTable = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const orders = [
    {
      id: "#ORD-001",
      customer: "Sarah Johnson",
      service: "Wedding Dress Alteration",
      amount: "₹450",
      status: "in-progress",
      priority: "high",
      deadline: "2024-01-20",
      startDate: "2024-01-15",
      estimatedHours: 8,
      completedHours: 4
    },
    {
      id: "#ORD-002",
      customer: "Mike Chen",
      service: "Suit Fitting & Alteration",
      amount: "₹320",
      status: "pending",
      priority: "medium",
      deadline: "2024-01-22",
      startDate: "2024-01-18",
      estimatedHours: 6,
      completedHours: 0
    },
    {
      id: "#ORD-003",
      customer: "Emma Davis",
      service: "Dress Hemming",
      amount: "₹180",
      status: "completed",
      priority: "low",
      deadline: "2024-01-18",
      startDate: "2024-01-16",
      estimatedHours: 3,
      completedHours: 3
    },
    {
      id: "#ORD-004",
      customer: "Alex Wilson",
      service: "Blouse Alteration",
      amount: "₹120",
      status: "in-progress",
      priority: "medium",
      deadline: "2024-01-25",
      startDate: "2024-01-20",
      estimatedHours: 4,
      completedHours: 2
    },
    {
      id: "#ORD-005",
      customer: "Lisa Brown",
      service: "Pants Tailoring",
      amount: "₹280",
      status: "cancelled",
      priority: "low",
      deadline: "2024-01-19",
      startDate: "2024-01-17",
      estimatedHours: 5,
      completedHours: 1
    },
    {
      id: "#ORD-006",
      customer: "John Smith",
      service: "Jacket Alteration",
      amount: "₹350",
      status: "pending",
      priority: "high",
      deadline: "2024-01-24",
      startDate: "2024-01-21",
      estimatedHours: 7,
      completedHours: 0
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = (completed, estimated) => {
    return Math.round((completed / estimated) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || order.priority === selectedPriority;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal">Order Management</h3>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiPackage className="w-4 h-4 mr-2" />
                  Order ID
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  Customer
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Service</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Progress</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Priority</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Deadline</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Amount
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => {
              const progressPercentage = getProgressPercentage(order.completedHours, order.estimatedHours);
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-medium text-charcoal">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-charcoal">{order.customer}</p>
                      <p className="text-sm text-gray-500">Started: {order.startDate}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-700">{order.service}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{progressPercentage}%</span>
                        <span className="text-sm text-gray-500">{order.completedHours}/{order.estimatedHours}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-gray-700">{order.deadline}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-charcoal">{order.amount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 hover:bg-coralblush hover:text-white rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                        title="Update Progress"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      {order.priority === "high" && (
                        <button 
                          className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          title="High Priority"
                        >
                          <FiAlertCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredOrders.length === 0 && (
        <div className="p-8 text-center">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found with the selected criteria.</p>
        </div>
      )}
      
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300">
              Add New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorOrdersTable; 