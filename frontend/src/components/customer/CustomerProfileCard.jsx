import React from "react";

const CustomerProfileCard = () => (
  <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
    <img
      src="https://randomuser.me/api/portraits/women/65.jpg"
      alt="Customer"
      className="w-20 h-20 rounded-full mb-4 border-4 border-beige shadow-md"
    />
    <h3 className="text-lg font-bold mb-2">Priya Sharma</h3>
    <p className="text-gray-700 mb-2">SewNova Customer</p>
    <div className="flex gap-4 text-sm text-gray-500">
      <span>Orders: 8</span>
      <span>Member: Gold</span>
    </div>
  </div>
);

export default CustomerProfileCard; 