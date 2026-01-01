import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import AuthContext from "../auth/AuthProvider";
import Alert from "../components/Alert";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access, user, isAuthenticated } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await apiClient(`/api/product/products/${id}/`, { method: "GET" });

        let data = null;
        if (!resp) throw new Error("Empty response from server");

        if (resp.IsSuccess && resp.Result) {
          data = resp.Result;
        } else if (resp.Result) {
          data = resp.Result;
        } else if (resp.id || resp.title) {
          data = resp;
        } else if (resp.results && Array.isArray(resp.results) && resp.results.length > 0) {
          data = resp.results[0];
        } else {
          throw new Error("Unexpected response format from products endpoint");
        }

        setProduct(data);
      } catch (err) {
        setError(err.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isOwner = () => {
    if (!user || !product) return false;
    return product.is_owner || user.id === product.owner_id;
  };

  const remove = async () => {
    if (!confirm("Delete this product permanently?")) return;
    setDeleting(true);
    try {
      await apiClient(`/api/product/products/${id}/`, { method: "DELETE" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || JSON.stringify(err));
      setDeleting(false);
    }
  };

  const edit = () => navigate(`/products/${id}/edit`);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsFavorite(!isFavorite);
    // TODO: Call API to add/remove favorite when endpoint is available
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString();
    } catch (e) {
      return iso;
    }
  };

  return (
    <main>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : product ? (
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            {isAuthenticated && (
              <button
                onClick={toggleFavorite}
                className={`text-4xl transition ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              >
                {isFavorite ? "❤" : "♡"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Status Badges */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.category === "Recycle" ? "bg-teal-100 text-teal-700" :
                  product.category === "Donate" ? "bg-purple-100 text-purple-700" :
                  product.category === "Sell" ? "bg-green-100 text-green-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {product.category || "Browse"}
                </span>
                
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {product.is_active ? "Active" : "Inactive"}
                </span>

                {product.is_free && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    Free
                  </span>
                )}

                {product.condition && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                    {product.condition}
                  </span>
                )}
              </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
              {product.image ? (
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description || "No description provided."}</p>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {product.is_free ? <span className="text-green-600">Free</span> : `NPR ${product.price}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="text-lg font-semibold text-gray-900">{product.condition || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-lg font-semibold text-gray-900">{product.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Posted On</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(product.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Seller Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Name</p>
                    <p className="font-semibold text-gray-900">{product.owner_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{product.owner_email}</p>
                  </div>
                  {product.owner_address1 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Address</p>
                      <p className="font-semibold text-gray-900">
                        {product.owner_address1} {product.owner_address2 ? `, ${product.owner_address2}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!isOwner() ? (
                  <>
                    <a
                      href={`mailto:${product.owner_email}?subject=Interested in ${encodeURIComponent(product.title)}`}
                      className="block w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Contact Seller
                    </a>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Back to Products
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={edit}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit Product
                    </button>
                    <button
                      onClick={remove}
                      disabled={deleting}
                      className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {deleting ? "Deleting..." : "Delete Product"}
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Back to Dashboard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
