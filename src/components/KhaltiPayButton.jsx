import React, { useState, useContext } from "react";
import paymentAPI from "../api/payment";
import { getErrorMessage } from "../utils/errorHandler";
import Toast from "./Toast";
import AuthContext from "../auth/AuthProvider";

export default function KhaltiPayButton({ listing, onError }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const amount = Math.round(listing.price * 100); // NPR → paisa

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/payment/callback`;
      const resp = await paymentAPI.initiate({
        amount,
        purchase_order_name: listing.title || "EcoLoop Product",
        return_url: returnUrl,
        customer_info: {
          name: user?.full_name || user?.name || "Customer",
          email: user?.email || "",
          phone: user?.phone_number || user?.phone || "",
        },
      });

      const result = resp?.Result || resp?.result || resp;
      const pidx = result?.pidx;
      const paymentUrl = result?.payment_url;

      if (!pidx || !paymentUrl) {
        throw new Error("Invalid payment initiation response");
      }

      localStorage.setItem("khalti_pidx", pidx);
      window.location.href = paymentUrl;
    } catch (err) {
      if (!err?.isUnauthorized) {
        setToast({
          type: "error",
          message: getErrorMessage(err, "Failed to initiate payment. Please try again."),
          key: Date.now(),
        });
      }
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: loading ? "#7c4dab" : "#5C2D91" }}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Initiating Payment...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="white" fillOpacity="0.2" />
              <text x="5" y="22" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">K</text>
            </svg>
            Pay with Khalti — NPR {listing.price}
          </>
        )}
      </button>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
