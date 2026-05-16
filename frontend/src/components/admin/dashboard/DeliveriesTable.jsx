import React, { useState } from "react";

const dummyDeliveries = [
  { id: 201, order: 101, status: "Out for Delivery" },
  { id: 202, order: 102, status: "Delivered" },
];

const DeliveriesTable = () => {
  const [deliveries] = useState(dummyDeliveries);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Deliveries</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Delivery ID</th>
            <th className="p-2">Order</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr key={d.id} className="border-b border-gray-800">
              <td className="p-2">{d.id}</td>
              <td className="p-2">{d.order}</td>
              <td className="p-2">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveriesTable; 