import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import productAPI from "../api/product";
import reviewAPI from "../api/review";
import AuthContext from "../auth/AuthProvider";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import ProductCard from "../components/ProductCard";
import ReviewModal from "../components/ReviewModal";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";

const REVIEWS_PER_PAGE = 10;

function renderStars(value, className = "text-sm") {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span className={`${className} text-yellow-400`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rounded ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function SellerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewSummary, setReviewSummary] = useState({
    average_rating: 0,
    total_count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviewList, setReviewList] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPermission, setReviewPermission] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  const isOwnProfile = useMemo(() => {
    if (!user || !userId) return false;
    return String(user.id) === String(userId);
  }, [user, userId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [userId]);

  useEffect(() => {
    setReviewPage(1);
  }, [userId]);

  useEffect(() => {
    const loadSellerData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch seller profile
        const profileResponse = await authAPI.getUserProfileById(userId);
        
        let profileData = null;
        if (profileResponse?.IsSuccess && profileResponse?.Result) {
          profileData = profileResponse.Result;
        } else if (profileResponse?.id || profileResponse?.email) {
          profileData = profileResponse;
        } else {
          throw new Error("Unable to load seller profile");
        }
        
        setSellerProfile(profileData);

        // Fetch seller's listings
        const listingsResponse = await productAPI.getUserListings(userId);
        
        let listingsData = [];
        if (listingsResponse?.IsSuccess && Array.isArray(listingsResponse?.Result)) {
          listingsData = listingsResponse.Result;
        } else if (Array.isArray(listingsResponse?.results)) {
          listingsData = listingsResponse.results;
        } else if (Array.isArray(listingsResponse)) {
          listingsData = listingsResponse;
        }
        
        setSellerListings(listingsData);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load seller profile"));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadSellerData();
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const [summaryResponse, listResponse] = await Promise.all([
          reviewAPI.getReviewSummary(userId),
          reviewAPI.getReviewsByUser(userId, reviewPage),
        ]);

        if (!mounted) return;

        setReviewSummary({
          average_rating: Number(summaryResponse?.average_rating || 0),
          total_count: Number(summaryResponse?.total_count || 0),
          breakdown: summaryResponse?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });

        setReviewList({
          count: Number(listResponse?.count || 0),
          next: listResponse?.next || null,
          previous: listResponse?.previous || null,
          results: Array.isArray(listResponse?.results) ? listResponse.results : [],
        });
      } catch (err) {
        if (!mounted) return;
        setReviewSummary({
          average_rating: 0,
          total_count: 0,
          breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setReviewList({ count: 0, next: null, previous: null, results: [] });
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    if (userId) {
      loadReviews();
    }

    return () => {
      mounted = false;
    };
  }, [userId, reviewPage, reviewRefreshKey]);

  useEffect(() => {
    if (!isAuthenticated || !userId || isOwnProfile) {
      setPermissionLoading(false);
      setReviewPermission({
        can_review: false,
        already_reviewed: false,
        existing_review_id: null,
      });
      return;
    }

    let mounted = true;
    setPermissionLoading(true);

    reviewAPI
      .canReviewUser(userId)
      .then((response) => {
        if (!mounted) return;
        setReviewPermission({
          can_review: !!response?.can_review,
          already_reviewed: !!response?.already_reviewed,
          existing_review_id: response?.existing_review_id || null,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setReviewPermission({
          can_review: false,
          already_reviewed: false,
          existing_review_id: null,
        });
      })
      .finally(() => {
        if (mounted) setPermissionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, userId, isOwnProfile, reviewRefreshKey]);

  const openReviewModal = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!reviewPermission?.can_review) return;

    const existingId = reviewPermission?.existing_review_id;
    const cachedReview = existingId
      ? reviewList.results.find((item) => String(item.id) === String(existingId))
      : null;

    setSelectedReview(cachedReview || null);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = (_review, mode) => {
    setToast({
      type: "success",
      message: mode === "edit" ? "Review updated successfully." : "Review submitted successfully.",
      key: Date.now(),
    });
    setReviewPage(1);
    setReviewRefreshKey((value) => value + 1);
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <span className="text-lg">←</span> Back
        </button>
        <Alert type="error">{error}</Alert>
      </main>
    );
  }

  if (!sellerProfile) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <span className="text-lg">←</span> Back
        </button>
        <Alert type="error">Seller profile not found</Alert>
      </main>
    );
  }

  const getInitial = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const totalReviewPages = Math.max(1, Math.ceil((reviewList.count || 0) / REVIEWS_PER_PAGE));

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
      >
        <span className="text-lg">←</span> Back
      </button>

      {/* Seller Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between gap-6">
          {/* Profile section */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl flex-shrink-0">
              {getInitial(sellerProfile.full_name)}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {sellerProfile.full_name || "Unknown Seller"}
              </h1>

              {(sellerProfile.city || sellerProfile.area) && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {[sellerProfile.area, sellerProfile.city].filter(Boolean).join(", ")}
                </p>
              )}

              {sellerProfile.created_at && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Member since {new Date(sellerProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
            <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 min-w-[150px] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-bold text-gray-900">
                {sellerListings.length}
              </p>
              <p className="text-xs text-gray-500">Active Listings</p>
            </div>

            <div className="bg-yellow-50 rounded-lg border border-yellow-200 px-4 py-3 min-w-[170px] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {Number(reviewSummary.average_rating || 0).toFixed(1)}
              </p>
              <div className="mt-1">{renderStars(reviewSummary.average_rating)}</div>
              <p className="text-xs text-yellow-700 mt-1">{reviewSummary.total_count} Reviews</p>
            </div>

            {!isOwnProfile && (
              <button
                onClick={openReviewModal}
                disabled={
                  permissionLoading ||
                  (isAuthenticated && (!reviewPermission || !reviewPermission.can_review))
                }
                className="w-full sm:w-auto sm:min-w-[190px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {permissionLoading
                  ? "Checking..."
                  : !isAuthenticated
                  ? "Login to Rate"
                  : reviewPermission?.already_reviewed
                  ? "Edit Your Review"
                  : "Rate Seller"}
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Reviews ({reviewSummary.total_count || reviewList.count || 0})
          </h2>
        </div>

        {reviewsLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Spinner />
          </div>
        ) : reviewList.results.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No reviews yet for this seller.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviewList.results.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {review.reviewer_profile_picture ? (
                        <img
                          src={review.reviewer_profile_picture}
                          alt={review.reviewer_name || "Reviewer"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                          {getInitial(review.reviewer_name)}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewer_name || "Anonymous User"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">{Number(review.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                    {review.comment || "No comment provided."}
                  </p>
                </div>
              ))}
            </div>

            {reviewList.count > REVIEWS_PER_PAGE && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => setReviewPage((page) => Math.max(1, page - 1))}
                  disabled={!reviewList.previous || reviewPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {reviewPage} of {totalReviewPages}
                </span>
                <button
                  onClick={() => setReviewPage((page) => page + 1)}
                  disabled={!reviewList.next}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Listings Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Listings ({sellerListings.length})</h2>

        {sellerListings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">This seller has no active listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        revieweeId={userId}
        existingReviewId={reviewPermission?.already_reviewed ? reviewPermission?.existing_review_id : null}
        initialReview={selectedReview}
        onSubmitted={handleReviewSubmitted}
      />

      {toast && (
        <Toast
          key={toast.key}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
