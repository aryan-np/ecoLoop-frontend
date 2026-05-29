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

const getItemType = (item) => item?.item_type || "product";

const normalizeCollection = (items, source) =>
  (items || [])
    .filter((item) => item && typeof item === "object" && item.id)
    .map((item) => ({
      ...item,
      item_type: getItemType(item),
      transaction_source: source,
    }));

const getProductStatus = (item) => {
  const itemType = getItemType(item);
  const status = (item.status || "available").toLowerCase();

  if (itemType === "scrap" || itemType === "donation") {
    return status === "pending" ? "available" : status;
  }

  return status;
};

const getBoughtStatus = (item) => {
  if ((item.status || "").toLowerCase() === "sold") return "bought";
  return item?.sold_to ? "bought" : "processing";
};

export default function MyListings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [boughtItems, setBoughtItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [section, setSection] = useState("listings");
  const [activeTab, setActiveTab] = useState("available");
  const [updating, setUpdating] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadTransactions();
  }, [isAuthenticated, navigate]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const [listingResp, boughtResp] = await Promise.all([
        productAPI.getListings(),
        productAPI.getBoughtItems(),
      ]);

      let ownedItems = [];
      if (listingResp?.IsSuccess && listingResp?.Result) {
        const result = listingResp.Result;
        ownedItems = [
          ...normalizeCollection(result.products, "listing"),
          ...normalizeCollection(result.scrap_requests, "listing"),
          ...normalizeCollection(result.donation_requests, "listing"),
        ];
      } else if (Array.isArray(listingResp)) {
        ownedItems = normalizeCollection(listingResp, "listing");
      }

      const boughtResults =
        boughtResp?.Result?.results ||
        boughtResp?.Result ||
        boughtResp?.results ||
        boughtResp;

      setListings(ownedItems);
      setBoughtItems(normalizeCollection(Array.isArray(boughtResults) ? boughtResults : [], "bought"));
    } catch (err) {
      console.error("Error loading transactions:", err);
      setToast({ type: "error", message: getErrorMessage(err, "Failed to load transactions"), key: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  const markAsSold = async (productId) => {
    setUpdating(productId);
    try {
      const resp = await productAPI.partialUpdateProduct(productId, { status: "sold" });

      if (resp && (resp.IsSuccess || resp.id)) {
        setToast({ type: "success", message: "Product marked as sold", key: Date.now() });
        loadTransactions();
      } else {
        setToast({ type: "error", message: getErrorMessage(resp, "Failed to mark as sold"), key: Date.now() });
      }
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to mark as sold"), key: Date.now() });
    } finally {
      setUpdating(null);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setUpdating(productId);
    try {
      await productAPI.deleteProduct(productId);
      setToast({ type: "success", message: "Product deleted successfully", key: Date.now() });
      loadTransactions();
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "Failed to delete product"), key: Date.now() });
    } finally {
      setUpdating(null);
    }
  };

  const editProduct = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  const getStatusCount = (status) =>
    listings.filter((item) => getProductStatus(item) === status).length;

  const getTypeCount = (type) => {
    const availableItems = listings.filter((item) => getProductStatus(item) === "available");
    if (type === "all") return availableItems.length;
    return availableItems.filter((item) => getItemType(item) === type).length;
  };

  const boughtStatusCount = (status) =>
    boughtItems.filter((item) => getBoughtStatus(item) === status).length;

  const filteredListings = listings.filter((item) => {
    if (getProductStatus(item) !== activeTab) return false;
    if (activeTab !== "available" || typeFilter === "all") return true;
    return getItemType(item) === typeFilter;
  });

  const filteredBoughtItems = boughtItems.filter((item) => getBoughtStatus(item) === activeTab);

  const listingTabs = [
    { key: "available", label: "Active", count: getStatusCount("available") },
    { key: "sold", label: "Sold", count: getStatusCount("sold") },
    { key: "donated", label: "Donated", count: getStatusCount("donated") },
    { key: "recycled", label: "Recycled", count: getStatusCount("recycled") },
  ];

  const boughtTabs = [
    { key: "bought", label: "Bought", count: boughtStatusCount("bought") },
    { key: "processing", label: "Processing", count: boughtStatusCount("processing") },
  ];

  const activeItems = section === "listings" ? filteredListings : filteredBoughtItems;

  const getItemDisplayInfo = (item) => {
    const itemType = getItemType(item);

    if (itemType === "scrap") {
      return {
        title: item.category_details?.material_type || "Scrap Request",
        subtitle: `${item.weight_kg} kg - ${item.category_details?.material_type || ""}`,
        badge: "Recycle",
        badgeColor: "bg-teal-600 text-white",
        price: `NPR ${(parseFloat(item.weight_kg || 0) * parseFloat(item.category_details?.rate_per_kg || 0)).toFixed(2)}`,
        location: item.pickup_address,
        image: item.images && item.images.length > 0 ? item.images[0].image : null,
        description: `Pickup: ${item.preferred_time_slot || "N/A"} | Condition: ${item.condition || "N/A"}`,
      };
    }

    if (itemType === "donation") {
      return {
        title: item.category_details?.name || "Donation Request",
        subtitle: `Qty: ${item.quantity || "N/A"} - ${item.condition_details?.name || ""}`,
        badge: "Donate",
        badgeColor: "bg-purple-600 text-white",
        price: "Free",
        location: item.pickup_address,
        image: item.images && item.images.length > 0 ? item.images[0].image : null,
        description: item.notes || "No additional notes",
      };
    }

    return {
      title: item.title || "Product",
      subtitle: `${getString(item.category)} - ${getString(item.condition)}`,
      badge: item.product_type === "donate" ? "Donate" : item.product_type === "recycle" ? "Recycle" : "Sell",
      badgeColor:
        item.product_type === "donate"
          ? "bg-purple-600 text-white"
          : item.product_type === "recycle"
            ? "bg-teal-600 text-white"
            : "bg-green-600 text-white",
      price: item.is_free ? "Free" : `NPR ${item.price || 0}`,
      location: item.location,
      image: item.images && item.images.length > 0 ? item.images[0].image : item.image,
      description: item.description || "",
    };
  };

  const emptyMessage =
    section === "listings"
      ? `No ${activeTab} items in your listings yet.`
      : activeTab === "bought"
        ? "You have not bought any products yet."
        : "No purchases are currently processing.";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} duration={2000} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Account activity</p>
            <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
            <p className="text-sm text-gray-600 mt-2">
              Track what you have listed and the products you have bought.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 self-start">
            <button
              onClick={() => {
                setSection("listings");
                setActiveTab("available");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                section === "listings" ? "bg-green-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Listings ({listings.length})
            </button>
            <button
              onClick={() => {
                setSection("bought");
                setActiveTab("bought");
                setTypeFilter("all");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                section === "bought" ? "bg-green-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bought Items ({boughtItems.length})
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-shrink-0">
            {section === "listings" && activeTab === "available" ? (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types ({getTypeCount("all")})</option>
                <option value="product">Sell ({getTypeCount("product")})</option>
                <option value="donation">Donation ({getTypeCount("donation")})</option>
                <option value="scrap">Scrap ({getTypeCount("scrap")})</option>
              </select>
            ) : (
              <div className="h-10" />
            )}
          </div>

          <div className="flex gap-6 flex-wrap">
            {(section === "listings" ? listingTabs : boughtTabs).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== "available") setTypeFilter("all");
                }}
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
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : activeItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center mt-6">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {activeItems.map((item) => {
            const itemType = getItemType(item);
            const status = getProductStatus(item);
            const isProduct = itemType === "product";
            const isOwnedListing = section === "listings";
            const isAvailableForSale = isOwnedListing && status === "available" && isProduct;
            const displayInfo = getItemDisplayInfo(item);

            return (
              <div key={`${section}-${itemType}-${item.id}`} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex gap-6 mb-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {displayInfo.image ? (
                      <img src={displayInfo.image} alt={displayInfo.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayInfo.title}</h3>

                        <div className="flex gap-2 mb-3 flex-wrap">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${displayInfo.badgeColor}`}>
                            {displayInfo.badge}
                          </span>

                          {isProduct && (
                            <>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {getString(item.category)}
                              </span>
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                {getString(item.condition)}
                              </span>
                            </>
                          )}

                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                            {section === "bought" ? `Status: ${getBoughtStatus(item)}` : displayInfo.subtitle || `Status: ${status}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-bold ${displayInfo.price === "Free" ? "text-green-600" : "text-gray-900"}`}>
                          {displayInfo.price}
                        </p>
                        {section === "bought" && item.sold_to && (
                          <p className="text-xs text-gray-500 mt-1">Purchased successfully</p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{displayInfo.description}</p>

                    {displayInfo.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                        </svg>
                        {displayInfo.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {isOwnedListing && isAvailableForSale && (
                    <button
                      onClick={() => markAsSold(item.id)}
                      disabled={updating === item.id}
                      className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded hover:bg-green-200 disabled:opacity-50 transition text-sm flex items-center justify-center gap-1"
                    >
                      {updating === item.id ? "Loading..." : "Mark as Sold"}
                    </button>
                  )}

                  {isOwnedListing && isProduct && status === "available" && (
                    <>
                      <button
                        onClick={() => editProduct(item.id)}
                        disabled={updating === item.id}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded hover:bg-blue-100 disabled:opacity-50 transition text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(item.id)}
                        disabled={updating === item.id}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100 disabled:opacity-50 transition text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
