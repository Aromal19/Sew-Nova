import React, { useState } from "react";

const dummyWaste = [
  { id: 1, type: "Fabric Scraps", amount: "5kg", handled: true },
  { id: 2, type: "Thread Waste", amount: "1kg", handled: false },
];

const WasteManagementTable = () => {
  const [waste, setWaste] = useState(dummyWaste);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Waste Management</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Type</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Handled</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {waste.map((w) => (
            <tr key={w.id} className="border-b border-gray-800">
              <td className="p-2">{w.type}</td>
              <td className="p-2">{w.amount}</td>
              <td className="p-2">{w.handled ? "Yes" : "No"}</td>
              <td className="p-2">
                {!w.handled && (
                  <button 
                    onClick={() => setWaste(waste.map(item => item.id === w.id ? { ...item, handled: true } : item))} 
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Mark Handled
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

export default WasteManagementTable; 