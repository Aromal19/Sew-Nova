import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2, FiPackage, FiUser, FiCalendar, FiTrendingUp } from "react-icons/fi";

const SellerOrdersTable = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const orders = [
    {
      id: "#ORD-001",
      customer: "Sarah Johnson",
      product: "Premium Silk Fabric",
      date: "2024-01-15",
      status: "completed",
      amount: "₹450",
      quantity: 5,
      paymentStatus: "paid"
    },
    {
      id: "#ORD-002",
      customer: "Mike Chen",
      product: "Cotton Blend Fabric",
      date: "2024-01-14",
      status: "processing",
      amount: "₹320",
      quantity: 3,
      paymentStatus: "paid"
    },
    {
      id: "#ORD-003",
      customer: "Emma Davis",
      product: "Wool Fabric",
      date: "2024-01-13",
      status: "shipped",
      amount: "₹280",
      quantity: 2,
      paymentStatus: "paid"
    },
    {
      id: "#ORD-004",
      customer: "Alex Wilson",
      product: "Linen Fabric",
      date: "2024-01-12",
      status: "pending",
      amount: "₹190",
      quantity: 4,
      paymentStatus: "pending"
    },
    {
      id: "#ORD-005",
      customer: "Lisa Brown",
      product: "Silk Blend Fabric",
      date: "2024-01-11",
      status: "completed",
      amount: "₹520",
      quantity: 6,
      paymentStatus: "paid"
    },
    {
      id: "#ORD-006",
      customer: "John Smith",
      product: "Cotton Fabric",
      date: "2024-01-10",
      status: "cancelled",
      amount: "₹150",
      quantity: 2,
      paymentStatus: "refunded"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "refunded": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal">Recent Orders</h3>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              <th className="text-left py-4 px-6 font-medium text-gray-700">Product</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  Date
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Payment</th>
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
            {filteredOrders.map((order, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-medium text-charcoal">{order.id}</span>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-charcoal">{order.customer}</p>
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-gray-700">{order.product}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-gray-700">{order.date}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
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
                      title="Edit Order"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredOrders.length === 0 && (
        <div className="p-8 text-center">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found with the selected status.</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersTable; 