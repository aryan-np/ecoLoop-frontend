import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import productAPI from "../api/product";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import ProductCard from "../components/ProductCard";
import { getErrorMessage } from "../utils/errorHandler";

export default function SellerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        <div className="flex items-start justify-between gap-6">
          {/* Profile section */}
          <div className="flex items-start gap-6">
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
          <div className="text-right">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {sellerListings.length}
              </p>
              <p className="text-xs text-gray-500">Active Listings</p>
            </div>
          </div>
        </div>
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
    </main>
  );
}
