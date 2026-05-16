import React from "react";
import { useNavigate } from "react-router-dom";

const TailorProfileCard = ({ tailor }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
          <span className="text-2xl text-white font-bold">
            {(tailor?.firstname || tailor?.firstName || 'T').charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {tailor?.firstname || tailor?.firstName} {tailor?.lastname || tailor?.lastName}
          </h3>
          <p className="text-gray-600 text-sm">{tailor?.shopName}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Experience:</span>
          <span className="text-gray-800 font-medium">{tailor?.experience} years</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Hourly Rate:</span>
          <span className="text-gray-800 font-medium">${tailor?.hourlyRate}/hr</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">Rating:</span>
          <div className="flex items-center">
            <span className="text-yellow-500">★★★★☆</span>
            <span className="text-gray-600 text-sm ml-1">(4.0)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations:</h4>
        <div className="flex flex-wrap gap-1">
          {tailor?.specializations?.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
            >
              {spec}
            </span>
          ))}
          {tailor?.specializations?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{tailor.specializations.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button onClick={() => navigate(`/customer/tailor/${tailor?._id}`)} className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
          View Profile
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Contact
        </button>
      </div>
    </div>
  );
};

export default TailorProfileCard; 