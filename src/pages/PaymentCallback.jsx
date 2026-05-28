import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import paymentAPI from "../api/payment";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      // Khalti sends pidx as a query param on redirect
      const pidxFromUrl = searchParams.get("pidx");
      const pidx = pidxFromUrl || localStorage.getItem("khalti_pidx");

      if (!pidx) {
        setStatus("failed");
        setMessage("Payment reference not found. Cannot verify payment.");
        scheduleRedirect("/products");
        return;
      }

      try {
        const resp = await paymentAPI.verify(pidx);
        const isSuccess = resp?.IsSuccess ?? resp?.is_success ?? false;
        const paymentStatus = resp?.Result?.status || resp?.result?.status || "";

        if (isSuccess && paymentStatus === "Completed") {
          localStorage.removeItem("khalti_pidx");
          setStatus("success");
          setMessage("Your payment was successful! Redirecting to browse items...");
          scheduleRedirect("/products");
        } else {
          setStatus("failed");
          setMessage(
            paymentStatus
              ? `Payment ${paymentStatus}. Redirecting...`
              : "Payment could not be verified. Redirecting..."
          );
          scheduleRedirect("/products");
        }
      } catch (err) {
        setStatus("failed");
        setMessage("An error occurred while verifying payment. Redirecting...");
        scheduleRedirect("/products");
      }
    };

    const scheduleRedirect = (path) => {
      setTimeout(() => navigate(path, { replace: true }), 3000);
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-10 max-w-md w-full text-center shadow-sm">
        {status === "verifying" && (
          <>
            <svg
              className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}
