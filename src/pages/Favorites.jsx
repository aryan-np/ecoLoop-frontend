import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import productAPI from "../api/product";
import AuthContext from "../auth/AuthProvider";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import ProductCard from "../components/ProductCard";
import { getErrorMessage } from "../utils/errorHandler";

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadFavorites();
  }, [isAuthenticated, navigate, page]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getFavorites(page);

      // Extract products from favorites (API returns wrapped format)
      const favoritesList = res?.results || [];
      const productsList = favoritesList.map(fav => ({
        ...fav.product,
        favorite_id: fav.id,
        is_favorited: true
      }));

      setProducts(productsList);
      setPagination({
        count: res?.count || 0,
        next: res?.next || null,
        previous: res?.previous || null,
      });
    } catch (err) {
      console.error("Error loading favorites:", err);
      setToast({
        type: "error",
        message: getErrorMessage(err, "Failed to load favorites"),
        key: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorites</h1>
        <p className="text-gray-600">Your saved products</p>
      </div>

      {toast && <Toast {...toast} />}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500 mb-4">You haven't saved any products yet</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination.count > 0 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.previous}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {Math.ceil(pagination.count / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.next}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
