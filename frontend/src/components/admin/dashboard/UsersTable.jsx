import React, { useState } from "react";

const dummyUsers = [
  { id: 1, name: "Alice Smith", email: "alice@email.com", status: "Active" },
  { id: 2, name: "Bob Johnson", email: "bob@email.com", status: "Pending" },
  { id: 3, name: "Carol Lee", email: "carol@email.com", status: "Active" },
];

const UsersTable = () => {
  const [users, setUsers] = useState(dummyUsers);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <table className="w-full text-left bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2 flex gap-2">
                {u.status === "Pending" && (
                  <button 
                    onClick={() => setUsers(users.map(user => user.id === u.id ? { ...user, status: "Active" } : user))} 
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                <button 
                  onClick={() => setUsers(users.filter(user => user.id !== u.id))} 
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

export default UsersTable; 