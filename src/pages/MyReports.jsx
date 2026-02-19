import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import reportAPI from "../api/report";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function getCategoryBadge(category) {
  const badges = {
    product: { label: "Product", color: "bg-blue-100 text-blue-800" },
    message: { label: "Message", color: "bg-purple-100 text-purple-800" },
    user_behavior: { label: "User Behavior", color: "bg-orange-100 text-orange-800" },
  };
  return badges[category] || { label: category, color: "bg-gray-100 text-gray-800" };
}

function getStatusBadge(status) {
  const badges = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800" },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
    dismissed: { label: "Dismissed", color: "bg-gray-100 text-gray-800" },
  };
  return badges[status] || { label: status, color: "bg-gray-100 text-gray-800" };
}

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getReports();
      let reportsList = [];

      if (response.IsSuccess && response.Result) {
        // Check if Result has a results array (paginated response)
        if (Array.isArray(response.Result.results)) {
          reportsList = response.Result.results;
        } else if (Array.isArray(response.Result)) {
          reportsList = response.Result;
        }
      } else if (Array.isArray(response.results)) {
        reportsList = response.results;
      } else if (Array.isArray(response)) {
        reportsList = response;
      }

      setReports(reportsList);
    } catch (error) {
      console.error("Error loading reports:", error);
      setToast({ type: "error", message: getErrorMessage(error, "Failed to load reports") });
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (reportId) => {
    setDetailLoading(true);
    try {
      const response = await reportAPI.getReportById(reportId);
      let reportData = null;

      if (response.IsSuccess && response.Result) {
        reportData = response.Result;
      } else if (response.id) {
        reportData = response;
      }

      if (reportData) {
        setSelectedReport(reportData);
      }
    } catch (error) {
      console.error("Error loading report detail:", error);
      setToast({ type: "error", message: getErrorMessage(error, "Failed to load report details") });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReportClick = (report) => {
    window.scrollTo(0, 0);
    setSelectedReport(report);
    loadReportDetail(report.id);
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-8 w-8 text-green-600"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </main>
    );
  }

  // Detail View
  if (selectedReport) {
    const categoryBadge = getCategoryBadge(selectedReport.category);
    const statusBadge = getStatusBadge(selectedReport.status);

    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={handleBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <span className="text-lg">←</span> Back to Reports
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-green-600"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryBadge.color}`}
                  >
                    {categoryBadge.label}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedReport.subject}
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on {formatDate(selectedReport.created_at)}
                </p>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h2>
                <p className="text-gray-900 whitespace-pre-line">
                  {selectedReport.description}
                </p>
              </div>

              {/* Attachment */}
              {selectedReport.attachment && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Attachment
                  </h2>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={selectedReport.attachment}
                      alt="Report attachment"
                      className="w-full max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {/* Related Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedReport.listing_id && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Related Listing
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/products/${selectedReport.listing_id}`)
                      }
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Listing #{selectedReport.listing_id}
                    </button>
                  </div>
                )}

                {selectedReport.conversation_id && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Related Conversation
                    </h3>
                    <button
                      onClick={() => navigate("/messages")}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Conversation #{selectedReport.conversation_id}
                    </button>
                  </div>
                )}

                {selectedReport.target_user_id && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Reported User
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/seller/${selectedReport.target_user_id}`)
                      }
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View User Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Response */}
              {selectedReport.admin_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Admin Response
                      </h3>
                      <p className="text-sm text-blue-800">
                        {selectedReport.admin_notes}
                      </p>
                      {selectedReport.reviewed_by_name && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed by {selectedReport.reviewed_by_name} on{" "}
                          {formatDate(selectedReport.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            duration={2000}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    );
  }

  // List View
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
      >
        <span className="text-lg">←</span> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">
            View and track your submitted reports
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Reports Yet
          </h3>
          <p className="text-gray-600">
            You haven't submitted any reports. If you encounter any issues,
            you can report them from the relevant pages.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const categoryBadge = getCategoryBadge(report.category);
            const statusBadge = getStatusBadge(report.status);

            return (
              <button
                key={report.id}
                onClick={() => handleReportClick(report)}
                className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryBadge.color}`}
                      >
                        {categoryBadge.label}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {report.subject}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {report.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted {formatDate(report.created_at)}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={2000}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
