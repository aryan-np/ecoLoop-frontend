import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productAPI from "../api/product";
import reviewAPI from "../api/review";
import { createThreadAndSendMessage } from "../api/communications";
import AuthContext from "../auth/AuthProvider";
import Toast from "../components/Toast";
import ImageCarousel from "../components/ImageCarousel";
import ReportModal from "../components/ReportModal";
import MapPreview from "../components/MapPreview";
import { getErrorMessage } from "../utils/errorHandler";
import KhaltiPayButton from "../components/KhaltiPayButton";

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

function renderStars(value) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span className="text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rounded ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ average_rating: 0, total_count: 0 });
  const [reviewSummaryLoading, setReviewSummaryLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    if (!normalized?.owner_id) return;

    let mounted = true;
    setReviewSummaryLoading(true);

    reviewAPI
      .getReviewSummary(normalized.owner_id)
      .then((response) => {
        if (!mounted) return;
        setReviewSummary({
          average_rating: Number(response?.average_rating || 0),
          total_count: Number(response?.total_count || 0),
        });
      })
      .catch(() => {
        if (!mounted) return;
        setReviewSummary({ average_rating: 0, total_count: 0 });
      })
      .finally(() => {
        if (mounted) setReviewSummaryLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [normalized?.owner_id]);

  const toggleFavorite = () => {
    setIsFavorite((p) => !p);
    // TODO: call favorite endpoint when available - will trigger 401 modal if unauthorized
  };

  const handleMessageSeller = async () => {
    if (messagingLoading) return;
    
    setMessagingLoading(true);
    try {
      console.log("Product:", product);
      console.log("Normalized:", normalized);
      
      const ownerId = product?.owner_id;
      
      if (!ownerId) {
        console.error("Owner ID not found. Product object:", product);
        setToast({ type: "error", message: "Could not identify seller. Please try again.", key: Date.now() });
        setMessagingLoading(false);
        return;
      }

      const defaultMessage = "Is this item still available?";
      const threadResponse = await createThreadAndSendMessage(
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
      // Don't show toast for unauthorized errors - the global modal will handle it
      if (!err?.isUnauthorized) {
        setToast({ type: "error", message: getErrorMessage(err, "Failed to send message. Please try again."), key: Date.now() });
      }
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
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
        {/* Left: Image Carousel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
          <ImageCarousel images={normalized.images || []} title={normalized.title} />
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

                {/* Khalti Pay — show for any priced listing that isn't donate/recycle */}
                {normalized.product_type !== "donate" &&
                  normalized.product_type !== "recycle" &&
                  normalized.status !== "sold" &&
                  !normalized.is_free &&
                  normalized.price && (
                    <KhaltiPayButton
                      listing={normalized}
                      onError={(err) => {
                        if (!err?.isUnauthorized) {
                          setToast({ type: "error", message: getErrorMessage(err, "Payment failed."), key: Date.now() });
                        }
                      }}
                    />
                  )}
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

          {/* Location Map */}
          {normalized.latitude && normalized.longitude && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Location</h2>
              <MapPreview latitude={normalized.latitude} longitude={normalized.longitude} />
            </div>
          )}

          {/* Seller info card */}
          <div 
            onClick={() => normalized.owner_id && navigate(`/seller/${normalized.owner_id}`)}
            className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all"
          >
            <h2 className="text-base font-semibold text-gray-900">Seller Information</h2>
            <div className="mt-3 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold group-hover:bg-green-200 transition-colors">
                {normalized.owner_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{normalized.owner_name}</p>
                <p className="text-xs text-gray-500">Verified Seller</p>
              </div>
              </div>

              <div className="text-right">
                {reviewSummaryLoading ? (
                  <p className="text-xs text-gray-400">Loading rating...</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {Number(reviewSummary.average_rating || 0).toFixed(1)} / 5
                    </p>
                    <p className="text-xs text-gray-500">
                      {renderStars(reviewSummary.average_rating)} ({reviewSummary.total_count})
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Report */}
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
            Report this listing
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingId={id}
      />

      {toast && <Toast type={toast.type} message={toast.message} duration={3000} onClose={() => setToast(null)} />}
    </main>
  );
}
