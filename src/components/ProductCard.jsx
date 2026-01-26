import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../auth/AuthProvider";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useContext(AuthContext);

  // Prevent rendering if product is invalid
  if (!product || !product.id) {
    return null;
  }

  // Helper function to safely extract string values (handle objects)
  const getString = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.name) return value.name;
    return String(value);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Favorite functionality here
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full flex flex-col">
        {/* Product Image */}
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isAuthenticated && (
            <button 
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition text-2xl bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >
              ♡
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 py-3 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{getString(product.title)}</h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="font-semibold">{getString(product.condition) || "Good"}</span>
            <span>•</span>
            <span>{getString(product.category)}</span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getString(product.description) || "No description"}</p>

          {/* Price and Status */}
          <div className="flex items-center justify-between mt-auto">
            <div className="text-lg font-bold text-gray-900">
              {product.is_free ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span>NPR {product.price || "N/A"}</span>
              )}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              product.is_free ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {product.is_free ? "Free" : "For Sale"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
