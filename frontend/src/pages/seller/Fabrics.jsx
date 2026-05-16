import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API_CONFIG, { getApiUrl } from "../../config/api";

const Fabrics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const isTokenNearExpiry = (jwtToken) => {
          try {
            if (!jwtToken) return true;
            const parts = jwtToken.split('.');
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
        const doRequest = async (useToken) => fetch(getApiUrl('SELLER_SERVICE', '/api/products?page=1&limit=50'), {
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
          throw new Error(data?.message || `Failed to fetch products`);
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
            <h1 className="text-3xl font-bold text-charcoal">My Fabrics</h1>
            <p className="text-gray-600 mt-2">View the products you have added.</p>
          </header>

          {loading && (
            <div className="text-gray-600">Loading...</div>
          )}
          {error && (
            <div className="text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {product.images?.[0]?.url && (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-charcoal">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-coralblush font-bold">₹{product.price}</span>
                      <span className="text-xs text-gray-500">{product.pricePerUnit?.replace('per_', ' per ')}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="mr-3">Category: {product.category}</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-gray-600">No fabrics found. Try adding some from Add Fabric.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Fabrics;

