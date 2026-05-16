import React, { useState } from "react";

const dummyFabrics = [
  { id: 1, name: "Silk", vendor: "Vendor A", stock: 120 },
  { id: 2, name: "Cotton", vendor: "Vendor B", stock: 80 },
];

const FabricSellersTable = () => {
  const [fabrics] = useState(dummyFabrics);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Fabric Sellers</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Fabric</th>
            <th className="p-2">Vendor</th>
            <th className="p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {fabrics.map((f) => (
            <tr key={f.id} className="border-b border-gray-800">
              <td className="p-2">{f.name}</td>
              <td className="p-2">{f.vendor}</td>
              <td className="p-2">{f.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FabricSellersTable; 