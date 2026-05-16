import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API_CONFIG, { getApiUrl } from "../../config/api";

const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("")
      try {
        const isTokenNearExpiry = (jwtToken) => {
          try {
            if (!jwtToken) return true;
            const parts = jwtToken.split('.')
            if (parts.length !== 3) return true;
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            const safetyWindowSeconds = 30;
            return typeof payload.exp !== 'number' || payload.exp <= (now + safetyWindowSeconds);
          } catch {
            return true;
          }
        };
        const ensureValidToken = async () => {
          let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
          if (!token || isTokenNearExpiry(token)) {
            try {
              const refreshResponse = await fetch(`${API_CONFIG.AUTH_SERVICE}/api/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include'
              });
              const refreshData = await refreshResponse.json();
              if (refreshData?.success && refreshData?.accessToken) {
                localStorage.setItem('accessToken', refreshData.accessToken);
                localStorage.setItem('token', refreshData.accessToken);
                token = refreshData.accessToken;
              }
            } catch {}
          }
          return token || '';
        };

        const token = await ensureValidToken();
        const doRequest = async (useToken) => fetch(getApiUrl('SELLER_SERVICE', '/api/products?page=1&limit=200'), {
          headers: { 'Authorization': `Bearer ${useToken}` },
          credentials: 'include'
        });
        let response = await doRequest(token);
        if (response.status === 401) {
          const refreshed = await ensureValidToken();
          response = await doRequest(refreshed);
        }
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to fetch inventory');
        }
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const stockBadge = (stock) => {
    if (stock < 10) return { text: 'Low', className: 'bg-red-100 text-red-800' };
    if (stock < 50) return { text: 'Medium', className: 'bg-orange-100 text-orange-800' };
    return { text: 'Healthy', className: 'bg-green-100 text-green-800' };
  };

  const toggleSort = (field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return field;
    });
  };

  const getValueForSort = (p, field) => {
    switch (field) {
      case 'name': return (p.name || '').toString().toLowerCase();
      case 'category': return (p.category || '').toString().toLowerCase();
      case 'stock': return Number(p.stock) || 0;
      case 'price': return Number(p.price) || 0;
      default: return '';
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const va = getValueForSort(a, sortBy);
    const vb = getValueForSort(b, sortBy);
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole="seller" 
      />

      <main className={`flex-1 transition-all duration-500 ease-in-out ${
        sidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
        <div className="p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-charcoal">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Monitor stock levels with visual indicators.</p>
          </header>

          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('name')}>Product {sortBy==='name' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('category')}>Category {sortBy==='category' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('stock')}>Units {sortBy==='stock' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('price')}>Price {sortBy==='price' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((p) => {
                      const badge = stockBadge(Number(p.stock) || 0);
                      return (
                        <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                {p.images?.[0]?.url ? (
                                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                                ) : null}
                              </div>
                              <div>
                                <p className="font-medium text-charcoal">{p.name}</p>
                                <p className="text-sm text-gray-500">{p._id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-charcoal">{p.stock}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-charcoal">₹{p.price}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-600">{p.pricePerUnit?.replace('per_', ' per ')}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {products.length === 0 && (
                <div className="p-8 text-center text-gray-500">No products found.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;

