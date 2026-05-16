import React, { useState } from "react";

const dummyOrders = [
  { id: 101, customer: "Alice Smith", tailor: "Tailor One", status: "In Progress" },
  { id: 102, customer: "Bob Johnson", tailor: "Tailor Two", status: "Delivered" },
];

const OrdersTable = () => {
  const [orders, setOrders] = useState(dummyOrders);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Order ID</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Tailor</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-gray-800">
              <td className="p-2">{o.id}</td>
              <td className="p-2">{o.customer}</td>
              <td className="p-2">{o.tailor}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2 flex gap-2">
                {o.status === "In Progress" && (
                  <button 
                    onClick={() => setOrders(orders.map(order => order.id === o.id ? { ...order, status: "Delivered" } : order))} 
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Mark Delivered
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable; 