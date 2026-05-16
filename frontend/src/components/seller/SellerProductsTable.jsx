import React, { useState } from "react";
import { FiEye, FiEdit, FiTrash2, FiBox, FiTag, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const SellerProductsTable = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: 1,
      name: "Premium Silk Fabric",
      category: "Silk",
      price: "₹45.00",
      stock: 25,
      sold: 45,
      revenue: "₹2,025",
      status: "active",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Cotton Blend Fabric",
      category: "Cotton",
      price: "₹32.00",
      stock: 50,
      sold: 38,
      revenue: "₹1,216",
      status: "active",
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Wool Blend Fabric",
      category: "Wool",
      price: "₹28.00",
      stock: 30,
      sold: 32,
      revenue: "₹896",
      status: "active",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop"
    },
    {
      id: 4,
      name: "Linen Fabric",
      category: "Linen",
      price: "₹35.00",
      stock: 15,
      sold: 28,
      revenue: "₹980",
      status: "low-stock",
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&h=100&fit=crop"
    },
    {
      id: 5,
      name: "Polyester Blend",
      category: "Synthetic",
      price: "₹18.00",
      stock: 0,
      sold: 55,
      revenue: "₹990",
      status: "out-of-stock",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop"
    },
    {
      id: 6,
      name: "Velvet Fabric",
      category: "Velvet",
      price: "₹55.00",
      stock: 12,
      sold: 18,
      revenue: "₹990",
      status: "active",
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&h=100&fit=crop"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "low-stock": return "bg-yellow-100 text-yellow-800";
      case "out-of-stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return "text-red-600";
    if (stock < 20) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...new Set(products.map(p => p.category))];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal">Product Inventory</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coralblush focus:border-transparent"
              />
              <FiBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-coralblush focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 font-medium text-gray-700">Product</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiTag className="w-4 h-4 mr-2" />
                  Category
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Stock</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Sold</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">
                <div className="flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Price
                </div>
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Revenue</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FiBox className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{product.name}</p>
                      <p className="text-sm text-gray-500">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {product.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-medium ${getStockColor(product.stock)}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-gray-700">{product.sold}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-charcoal">{product.price}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-charcoal">{product.revenue}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-coralblush hover:text-white rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="p-8 text-center">
          <FiBox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found with the selected criteria.</p>
        </div>
      )}
      
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gradient-to-r from-coralblush to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-coralblush transition-all duration-300">
              Add New Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductsTable; 