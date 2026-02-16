import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import productAPI from "../api/product";
import ProductCard from "../components/ProductCard";
import Toast from "../components/Toast";
import AuthContext from "../auth/AuthProvider";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [activeTab, setActiveTab] = useState("browse");
  const productsRef = useRef(null);

  useEffect(() => {
    loadCategoriesAndConditions();
    loadProducts(currentPage);
  }, [currentPage, searchTerm, minPrice, maxPrice, category, condition]);

  const loadCategoriesAndConditions = async () => {
    try {
      const [cResp, condResp] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getConditions(),
      ]);

      setCategories(Array.isArray(cResp?.results) ? cResp.results : []);
      setConditions(Array.isArray(condResp?.results) ? condResp.results : []);
    } catch (err) {
      console.error("Error loading categories or conditions:", err);
    }
  };

  const buildFilterParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (minPrice) params.append("price_min", minPrice);
    if (maxPrice) params.append("price_max", maxPrice);
    if (category) params.append("category", category);
    if (condition) params.append("condition", condition);
    params.append("page", currentPage);
    return params.toString();
  };

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm,
        price_min: minPrice,
        price_max: maxPrice,
        category: category,
        condition: condition,
        page: currentPage
      };
      const resp = await productAPI.getProducts(filters);

      let productsArray = [];
      let paginationData = { count: 0, next: null, previous: null };

      // Handle the paginated response format
      if (resp && resp.IsSuccess && resp.Result) {
        const result = resp.Result;
        if (result.results && Array.isArray(result.results)) {
          productsArray = result.results;
          paginationData = {
            count: result.count || 0,
            next: result.next,
            previous: result.previous
          };
        }
      } else if (resp && resp.results && Array.isArray(resp.results)) {
        productsArray = resp.results;
        paginationData = {
          count: resp.count || 0,
          next: resp.next,
          previous: resp.previous
        };
      }

      // Ensure all items are objects with required fields
      const validProducts = (productsArray || []).filter(p => p && typeof p === 'object' && p.id);
      setProducts(validProducts);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error loading products:", err);
      const errorMessage = err.message || "Failed to load products";
      setToast({ type: "error", message: errorMessage });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products;

  const handleFilterChange = (filterType, value) => {
    if (filterType === "search") setSearchTerm(value);
    if (filterType === "minPrice") setMinPrice(value);
    if (filterType === "maxPrice") setMaxPrice(value);
    if (filterType === "category") setCategory(value);
    if (filterType === "condition") setCondition(value);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Error Display */}
      {toast && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
        <p className="text-gray-600">Discover amazing items for reuse, recycle, and donate</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <button 
          onClick={() => { setActiveTab("browse"); productsRef.current?.scrollIntoView({ behavior: "smooth" }); }}
          className={`rounded-lg border p-4 text-center hover:shadow-md transition ${
            activeTab === "browse" 
              ? "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400" 
              : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400"
          }`}
        >
          <div className="text-3xl mb-2 bg-blue-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Browse to Buy</h3>
          <p className="text-xs text-gray-600">Find items for purchase</p>
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
          <p className="text-xs text-gray-600">Earn by listing items</p>
        </button>
        
        <button 
          onClick={() => navigate('/donate')}
          className={`rounded-lg border p-4 text-center hover:shadow-md transition ${
            activeTab === "donate" 
              ? "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400" 
              : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 hover:border-purple-400"
          }`}
        >
          <div className="text-3xl mb-2 bg-purple-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Donate Something</h3>
          <p className="text-xs text-gray-600">Give items a second life</p>
        </button>
        
        <button 
          onClick={() => navigate('/recycle')}
          className={`rounded-lg border p-4 text-center hover:shadow-md transition ${
            activeTab === "recycle" 
              ? "bg-gradient-to-br from-teal-100 to-teal-200 border-teal-400" 
              : "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-300 hover:border-teal-400"
          }`}
        >
          <div className="text-3xl mb-2 bg-teal-500 text-white p-2 rounded-lg w-fit mx-auto">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 8c-1.1 0-1.99.9-1.99 2L5 19c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-1V6c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v2H7zm5-2h4v2h-4V6zm-5 4h10v9H7v-9zm2 2v5h2v-5H9zm4 0v5h2v-5h-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Recycle Items</h3>
          <p className="text-xs text-gray-600">Close the loop responsibly</p>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex gap-3 mb-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select 
                  value={condition}
                  onChange={(e) => handleFilterChange("condition", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Conditions</option>
                  {conditions.map((cond) => (
                    <option key={cond.id} value={cond.id}>{cond.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCategory("");
                  setCondition("");
                  setCurrentPage(1);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Clear Filters
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filteredProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.count > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => {
                setCurrentPage(Math.max(1, currentPage - 1));
                setSearchParams({ page: Math.max(1, currentPage - 1) });
              }}
              disabled={!pagination.previous || currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(pagination.count / 10) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setSearchParams({ page });
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition ${
                    currentPage === page
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setCurrentPage(currentPage + 1);
                setSearchParams({ page: currentPage + 1 });
              }}
              disabled={!pagination.next}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Scroll to Top Button */}
        {!loading && pagination.count > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              ↑ Scroll to Top
            </button>
          </div>
        )}
      </div>

      {/* Toast for notifications */}
      {toast && <Toast type={toast.type} message={toast.message} duration={2000} />}
    </main>
  );
}
