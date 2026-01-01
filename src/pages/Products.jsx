import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import AuthContext from "../auth/AuthProvider";

export default function Products() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const productsRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const resp = await apiClient("/api/product/products/", { method: "GET" });

      // Handle multiple backend shapes
      if (Array.isArray(resp)) {
        setProducts(resp);
      } else if (resp && Array.isArray(resp.results)) {
        setProducts(resp.results);
      } else if (resp && resp.IsSuccess) {
        const r = resp.Result;
        if (Array.isArray(r)) setProducts(r);
        else if (r && Array.isArray(r.results)) setProducts(r.results);
        else if (r) setProducts(Array.isArray(r) ? r : [r]);
        else setProducts([]);
      } else {
        if (resp && Object.keys(resp).length === 0) setProducts([]);
        else if (resp) setProducts(Array.isArray(resp) ? resp : [resp]);
        else setProducts([]);
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to load products";
      setToast({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
        <p className="text-gray-600">Discover amazing items for reuse, recycle, and donate</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <button 
          onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-4 text-center hover:shadow-md transition hover:border-blue-400"
        >
          <div className="text-3xl mb-2 bg-blue-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Browse Items</h3>
          <p className="text-xs text-gray-600">Find items to buy</p>
        </button>
        
        <button 
          onClick={() => navigate("/products/new")}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300 p-4 text-center hover:shadow-md transition hover:border-green-400"
        >
          <div className="text-3xl mb-2 bg-green-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Sell Your Item</h3>
          <p className="text-xs text-gray-600">List your items</p>
        </button>
        
        <button className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-4 text-center hover:shadow-md transition hover:border-blue-400">
          <div className="text-3xl mb-2 bg-blue-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Favorites</h3>
          <p className="text-xs text-gray-600">Your saved items</p>
        </button>
        
        <button className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-300 p-4 text-center hover:shadow-md transition hover:border-purple-400">
          <div className="text-3xl mb-2 bg-purple-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">My Listings</h3>
          <p className="text-xs text-gray-600">Your posted items</p>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex gap-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="recycle">Recycle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Conditions</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Prices</option>
                  <option value="free">Free</option>
                  <option value="0-500">0 - 500 NPR</option>
                  <option value="500-2000">500 - 2000 NPR</option>
                  <option value="2000+">2000+ NPR</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Stats */}
      {/* Removed: Total Items, Available Now, and Categories cards */}

      {/* Products Grid */}
      <div ref={productsRef}>
        {loading && <div className="text-center py-12 text-gray-600">Loading products...</div>}

        {!loading && filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No products found</p>
            {searchTerm && <p className="text-sm text-gray-500">Try adjusting your search or filters</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}
      </div>

      {/* Toast for notifications */}
      {toast && <Toast type={toast.type} message={toast.message} duration={2000} />}
    </main>
  );
}
