import React from "react";
import { FiTrendingUp, FiTrendingDown, FiPackage } from "react-icons/fi";

const SellerStatsWidget = () => {
  const stats = [
    {
      title: "Total Products",
      value: "24",
      change: "+3",
      trend: "up",
      icon: FiPackage,
      color: "from-lilac to-purple-500"
    },
    {
      title: "Active Products",
      value: "22",
      change: "+2",
      trend: "up",
      icon: FiPackage,
      color: "from-champagne to-yellow-500"
    },
    {
      title: "Categories",
      value: "8",
      change: "+1",
      trend: "up",
      icon: FiPackage,
      color: "from-mint to-green-500"
    },
    {
      title: "Low Stock",
      value: "3",
      change: "-1",
      trend: "down",
      icon: FiPackage,
      color: "from-coralblush to-pink-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-xl font-bold text-charcoal mt-1">{stat.value}</p>
              <div className="flex items-center mt-2">
                {stat.trend === "up" ? (
                  <FiTrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <FiTrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 text-xs ml-1">vs last month</span>
              </div>
            </div>
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerStatsWidget; 