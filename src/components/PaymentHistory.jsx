import React, { useEffect, useState } from "react";
import paymentAPI from "../api/payment";

function StatusBadge({ status }) {
  const isCompleted = status === "Completed";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isCompleted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(paisa) {
  if (paisa == null) return "—";
  return `NPR ${paisa / 100}`;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await paymentAPI.list(page);
        const results = resp?.results || resp?.Result?.results || (Array.isArray(resp) ? resp : []);
        setPayments(results);
        setNextPage(resp?.next || null);
        setPrevPage(resp?.previous || null);
      } catch (err) {
        setError("Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <svg className="animate-spin h-7 w-7 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (payments.length === 0) {
    return <p className="text-sm text-gray-500">No payment history found.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Item</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{formatDate(p.created_at || p.date)}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {p.purchase_order_name || p.item_name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">{formatAmount(p.total_amount || p.amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(prevPage || nextPage) && (
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={!prevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            disabled={!nextPage}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
