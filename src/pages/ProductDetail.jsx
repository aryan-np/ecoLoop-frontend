import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productAPI from "../api/product";
import { createThreadAndSendMessage } from "../api/communications";
import AuthContext from "../auth/AuthProvider";
import Alert from "../components/Alert";

function getName(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v.name) return v.name;
  return "";
}

function formatPrice(isFree, price) {
  if (isFree) return "Free";
  if (price === null || price === undefined || price === "") return "N/A";
  return `NPR ${price}`;
}

function listingBadge(productType) {
  const t = (productType || "").toLowerCase();
  if (t === "sell") return { label: "For Sale", cls: "bg-green-600 text-white" };
  if (t === "donate") return { label: "Donate", cls: "bg-purple-600 text-white" };
  if (t === "recycle") return { label: "Recycle", cls: "bg-teal-600 text-white" };
  return { label: "Listing", cls: "bg-blue-600 text-white" };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, access } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await productAPI.getProductById(id);

        let data = null;
        if (!resp) throw new Error("Empty response from server");

        if (resp.IsSuccess && resp.Result) data = resp.Result;
        else if (resp.Result) data = resp.Result;
        else if (resp.id || resp.title) data = resp;
        else if (resp.results && Array.isArray(resp.results) && resp.results.length > 0) data = resp.results[0];
        else throw new Error("Unexpected response format from products endpoint");

        setProduct(data);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const normalized = useMemo(() => {
    if (!product) return null;
    const categoryName = getName(product.category) || "N/A";
    const conditionName = getName(product.condition) || "N/A";

    return {
      ...product,
      categoryName,
      conditionName,
      owner_name: product.owner_name || "Unknown",
      owner_email: product.owner_email || "",
      location: product.location || "N/A",
      displayPrice: formatPrice(product.is_free, product.price),
      badge: listingBadge(product.product_type),
    };
  }, [product]);

  const isOwner = useMemo(() => {
    if (!user || !normalized) return false;
    return !!normalized.is_owner || user.id === normalized.owner_id;
  }, [user, normalized]);

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsFavorite((p) => !p);
    // TODO: call favorite endpoint when available
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (messagingLoading) return;
    
    setMessagingLoading(true);
    try {
      console.log("Product:", product);
      console.log("Normalized:", normalized);
      
      const ownerId = product?.owner_id;
      
      if (!ownerId) {
        console.error("Owner ID not found. Product object:", product);
        alert("Could not identify seller. Please try again.");
        setMessagingLoading(false);
        return;
      }

      const defaultMessage = "Is this item still available?";
      const threadResponse = await createThreadAndSendMessage(
        access,
        ownerId,
        defaultMessage,
        product?.id
      );
      
      console.log("Thread response:", threadResponse);
      
      // Navigate to messages page with the thread ID
      navigate("/messages", { 
        state: { threadId: threadResponse.id || threadResponse.thread_id } 
      });
    } catch (err) {
      console.error("Error creating message thread:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setMessagingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Alert type="error">{error}</Alert>
      </main>
    );
  }

  if (!normalized) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Top back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
      >
        <span className="text-lg">←</span> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-max">
        {/* Left: Image */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
            {normalized.image ? (
              <img src={normalized.image} alt={normalized.title} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* Right: Main Card */}
        <div className="space-y-4 lg:overflow-y-auto lg:max-h-[calc(100vh-200px)]">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${normalized.badge.cls}`}>
                  {normalized.badge.label}
                </span>

                <h1 className="text-3xl font-bold text-gray-900 mt-3">
                  {normalized.title}
                </h1>

                <p className="text-lg font-bold text-green-700 mt-2">
                  {normalized.displayPrice}
                </p>
              </div>

              {/* Heart */}
              <button
                onClick={toggleFavorite}
                className={`text-2xl leading-none mt-1 ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                aria-label="favorite"
                title="Save to favorites"
              >
                {isFavorite ? "♥" : "♡"}
              </button>
            </div>

            {/* Details rows (like screenshot) */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-900 font-medium">{normalized.categoryName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Condition</span>
                <span className="text-gray-900 font-medium">{normalized.conditionName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900 font-medium">{normalized.location}</span>
              </div>
            </div>

            {/* Owner Info Box */}
            {isOwner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 font-medium">This is your listing</p>
                <button
                  onClick={() => navigate("/my-listings")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2 flex items-center gap-1"
                >
                  Manage in My Listings →
                </button>
              </div>
            )}

            {/* Actions (like screenshot) */}
            {!isOwner && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleMessageSeller}
                  disabled={messagingLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {messagingLoading ? "Sending..." : "Message Seller"}
                </button>

                <button
                  onClick={toggleFavorite}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save to Favorites
                </button>
              </div>
            )}
          </div>

          {/* Description card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900">Description</h2>
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
              {normalized.description || "No description provided."}
            </p>
          </div>

          {/* Seller info card */}
          <div 
            onClick={() => normalized.owner_id && navigate(`/seller/${normalized.owner_id}`)}
            className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all"
          >
            <h2 className="text-base font-semibold text-gray-900">Seller Information</h2>
            <div className="mt-3 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold group-hover:bg-green-200 transition-colors">
                {normalized.owner_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{normalized.owner_name}</p>
                <p className="text-xs text-gray-500">Verified Seller</p>
              </div>
            </div>
          </div>

          {/* Report */}
          <button className="text-sm text-gray-500 hover:text-gray-800">
            Report this listing
          </button>
        </div>
      </div>
    </main>
  );
}
