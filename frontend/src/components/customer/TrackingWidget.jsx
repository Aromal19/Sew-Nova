import React from "react";

const TrackingWidget = () => (
  <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center">
    <h3 className="text-lg font-bold mb-2">Order Tracking</h3>
    <p className="text-gray-700">Track your order status and delivery updates here.</p>
    <div className="mt-4 w-full">
      <div className="bg-beige rounded-full h-2 w-full mb-2">
        <div className="bg-green-400 h-2 rounded-full" style={{ width: '60%' }}></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Ordered</span>
        <span>Shipped</span>
        <span>Delivered</span>
      </div>
    </div>
  </div>
);

export default TrackingWidget; 