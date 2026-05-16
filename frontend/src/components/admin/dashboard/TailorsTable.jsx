import React, { useState } from "react";

const dummyTailors = [
  { id: 1, name: "Tailor One", location: "City A", status: "Verified" },
  { id: 2, name: "Tailor Two", location: "City B", status: "Pending" },
];

const TailorsTable = () => {
  const [tailors, setTailors] = useState(dummyTailors);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tailors</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Name</th>
            <th className="p-2">Location</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tailors.map((t) => (
            <tr key={t.id} className="border-b border-gray-800">
              <td className="p-2">{t.name}</td>
              <td className="p-2">{t.location}</td>
              <td className="p-2">{t.status}</td>
              <td className="p-2 flex gap-2">
                {t.status === "Pending" && (
                  <button 
                    onClick={() => setTailors(tailors.map(tailor => tailor.id === t.id ? { ...tailor, status: "Verified" } : tailor))} 
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Verify
                  </button>
                )}
                <button 
                  onClick={() => setTailors(tailors.filter(tailor => tailor.id !== t.id))} 
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TailorsTable; 