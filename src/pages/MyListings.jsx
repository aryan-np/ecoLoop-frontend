import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import productAPI from "../api/product";
import AuthContext from "../auth/AuthProvider";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";

const getString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.name) return value.name;
  return String(value);
};

export default function MyListings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadListings();
  }, [isAuthenticated, navigate]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const resp = await productAPI.getListings();

      let allListings = [];

      if (resp && resp.IsSuccess && resp.Result) {
        const result = resp.Result;
        
        // Combine products, scrap_requests, and donation_requests
        const products = Array.isArray(result.products) ? result.products : [];
        const scrapRequests = Array.isArray(result.scrap_requests) ? result.scrap_requests : [];
        const donationRequests = Array.isArray(result.donation_requests) ? result.donation_requests : [];
        
        allListings = [...products, ...scrapRequests, ...donationRequests];
      } else if (Array.isArray(resp)) {
        allListings = resp;
      }

      const validListings = (allListings || []).filter(item => item && typeof item === 'object' && item.id);
      setListings(validListings);
    } catch (err) {
      console.error("Error loading listings:", err);
      setToast({ type: "error", message: getErrorMessage(err, "Failed to load listings"), key: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  const markAsSold = async (productId) => {
    setUpdating(productId);
    try {
      const resp = await productAPI.partialUpdateProduct(productId, { status: "sold" });

      if (resp && (resp.IsSuccess || resp.id)) {
        setToast({ type: "success", message: "Product marked as sold" });
        loadListings();
      } else {
        setToast({ type: "error", message: getErrorMessage(resp, "Failed to mark as sold") });
      }
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to mark as sold") });
    } finally {
      setUpdating(null);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setUpdating(productId);
    try {
      await productAPI.deleteProduct(productId);
      setToast({ type: "success", message: "Product deleted successfully" });
      loadListings();
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to delete product") });
    } finally {
      setUpdating(null);
    }
  };

  const editProduct = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  // Filter products by status
  const filteredListings = listings.filter((item) => {
    const status = (item.status || "available").toLowerCase();
    // For scrap and donation, "Pending" should be treated as "available"
    if (item.item_type === "scrap" || item.item_type === "donation") {
      const mappedStatus = status === "pending" ? "available" : status;
      return mappedStatus === activeTab;
    }
    return status === activeTab;
  });

  // Count products by status
  const getStatusCount = (status) => {
    return listings.filter((item) => {
      const itemStatus = (item.status || "available").toLowerCase();
      // For scrap and donation, "Pending" should be treated as "available"
      if (item.item_type === "scrap" || item.item_type === "donation") {
        const mappedStatus = itemStatus === "pending" ? "available" : itemStatus;
        return mappedStatus === status;
      }
      return itemStatus === status;
    }).length;
  };

  const STATUS_TABS = [
    { key: "available", label: "Active", count: getStatusCount("available") },
    { key: "sold", label: "Sold", count: getStatusCount("sold") },
    { key: "donated", label: "Donated", count: getStatusCount("donated") },
    { key: "recycled", label: "Recycled", count: getStatusCount("recycled") },
  ];

  // Helper function to get display information based on item type
  const getItemDisplayInfo = (item) => {
    if (item.item_type === "scrap") {
      return {
        title: item.category_details?.material_type || "Scrap Request",
        subtitle: `${item.weight_kg} kg - ${item.category_details?.material_type || ''}`,
        badge: "Recycle",
        badgeColor: "bg-teal-600 text-white",
        price: `NPR ${(parseFloat(item.weight_kg || 0) * parseFloat(item.category_details?.rate_per_kg || 0)).toFixed(2)}`,
        location: item.pickup_address,
        image: null,
        description: `Pickup: ${item.preferred_time_slot || 'N/A'} | Condition: ${item.condition || 'N/A'}`,
      };
    } else if (item.item_type === "donation") {
      return {
        title: item.category_details?.name || "Donation Request",
        subtitle: `Qty: ${item.quantity || 'N/A'} - ${item.condition_details?.name || ''}`,
        badge: "Donate",
        badgeColor: "bg-purple-600 text-white",
        price: "Free",
        location: item.pickup_address,
        image: null,
        description: item.notes || "No additional notes",
      };
    } else {
      // Product
      return {
        title: item.title || "Product",
        subtitle: `${getString(item.category)} - ${getString(item.condition)}`,
        badge: "Sell",
        badgeColor: "bg-green-600 text-white",
        price: item.is_free ? "Free" : `NPR ${item.price || 0}`,
        location: item.location,
        image: item.images && item.images.length > 0 ? item.images[0].image : item.image,
        description: item.description || "",
      };
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} duration={2000} />}

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Listings</h1>

      {/* Status Tabs */}
      <div className="border-b border-gray-200 mb-6 flex gap-8">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === tab.key
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No {activeTab} listings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((item) => {
            const status = (item.status || "available").toLowerCase();
            const isProduct = item.item_type === "product";
            const isAvailableForSale = status === "available" && isProduct;
            const displayInfo = getItemDisplayInfo(item);

            return (
              <div
                key={`${item.item_type}-${item.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                {/* Top row: Image, Details, Price */}
                <div className="flex gap-6 mb-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {displayInfo.image ? (
                      <img
                        src={displayInfo.image}
                        alt={displayInfo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayInfo.title}</h3>

                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${displayInfo.badgeColor}`}>
                        {displayInfo.badge}
                      </span>
                      {item.item_type === "product" && (
                        <>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {getString(item.category)}
                          </span>
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                            {getString(item.condition)}
                          </span>
                        </>
                      )}
                      {item.item_type === "scrap" && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {displayInfo.subtitle}
                        </span>
                      )}
                      {item.item_type === "donation" && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {displayInfo.subtitle}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{displayInfo.description}</p>

                    {/* Location */}
                    {displayInfo.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                        </svg>
                        {displayInfo.location}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {typeof displayInfo.price === 'string' && displayInfo.price === "Free" ? (
                      <p className="text-lg font-bold text-green-600">Free</p>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">{displayInfo.price}</p>
                    )}
                  </div>
                </div>

                {/* Buttons Row Below - Only for products */}
                {isProduct && (
                  <div className="flex gap-2 flex-wrap">
                    {isAvailableForSale && (
                      <button
                        onClick={() => markAsSold(item.id)}
                        disabled={updating === item.id}
                        className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 disabled:opacity-50 transition text-sm flex items-center justify-center gap-1"
                      >
                        {updating === item.id ? (
                          <>Loading...</>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            Mark as Sold
                          </>
                        )}
                      </button>
                    )}

                    {status === "available" && (
                      <>
                        <button
                          onClick={() => editProduct(item.id)}
                          disabled={updating === item.id}
                          className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded hover:bg-blue-100 disabled:opacity-50 transition text-sm flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProduct(item.id)}
                          disabled={updating === item.id}
                          className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100 disabled:opacity-50 transition text-sm flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
