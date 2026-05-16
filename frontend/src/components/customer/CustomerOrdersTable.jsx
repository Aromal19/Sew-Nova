import React from "react";

const CustomerOrdersTable = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-xl shadow">
      <thead>
        <tr>
          <th className="px-4 py-2">Order ID</th>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-4 py-2">#12345</td>
          <td className="border px-4 py-2">2024-06-01</td>
          <td className="border px-4 py-2">Shipped</td>
          <td className="border px-4 py-2">₹120</td>
        </tr>
        <tr>
          <td className="border px-4 py-2">#12346</td>
          <td className="border px-4 py-2">2024-06-03</td>
          <td className="border px-4 py-2">Processing</td>
          <td className="border px-4 py-2">₹80</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default CustomerOrdersTable; 