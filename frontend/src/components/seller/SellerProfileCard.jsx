import React from "react";

const SellerProfileCard = () => (
  <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
    <img
      src="https://randomuser.me/api/portraits/men/45.jpg"
      alt="Seller"
      className="w-20 h-20 rounded-full mb-4 border-4 border-beige shadow-md"
    />
    <h3 className="text-lg font-bold mb-2">Alex Fabricson</h3>
    <p className="text-gray-700 mb-2">Premium Cotton Seller</p>
    <div className="flex gap-4 text-sm text-gray-500">
      <span>Rating: 4.9</span>
      <span>Orders: 120</span>
    </div>
  </div>
);

export default SellerProfileCard; 