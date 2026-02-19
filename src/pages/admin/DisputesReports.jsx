import { useState, useEffect } from 'react';
import reportAPI from '../../api/report';
import Toast from '../../components/Toast';
import { getErrorMessage } from '../../utils/errorHandler';

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

const DisputesReports = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
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
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading report detail:", error);
      setToast({ type: "error", message: getErrorMessage(error, "Failed to load report details") });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = (report) => {
    loadReportDetail(report.id);
  };

  const filteredReports = reports.filter(report => {
    const matchesTab = activeTab === 'all' || report.status === activeTab;
    const matchesSearch = searchQuery === '' ||
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    under_review: reports.filter(r => r.status === 'under_review').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-teal-600 font-medium">Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Disputes & Reports</h1>
        <p className="text-gray-600 mt-1">Manage marketplace disputes and user reports</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({tabCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({tabCounts.pending})
            </button>
            <button
              onClick={() => setActiveTab('under_review')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'under_review'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              In Review ({tabCounts.under_review})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'resolved'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Resolved ({tabCounts.resolved})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, reported user, or reporter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-teal-600"
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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const categoryBadge = getCategoryBadge(report.category);
                    const statusBadge = getStatusBadge(report.status);

                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${categoryBadge.color}`}>
                            {categoryBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{report.subject}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{report.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.user_name}</div>
                          <div className="text-xs text-gray-500">{report.user_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleReview(report)}
                            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            {detailLoading ? (
              <div className="flex justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-teal-600"
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
              <div className="p-6 space-y-6">
                {/* Status and Category Badges */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(selectedReport.category).color}`}>
                    {getCategoryBadge(selectedReport.category).label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedReport.status).color}`}>
                    {getStatusBadge(selectedReport.status).label}
                  </span>
                </div>

                {/* Subject */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedReport.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Reported on {formatDate(selectedReport.created_at)}
                  </p>
                </div>

                {/* Reporter Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Reporter Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {selectedReport.user_name}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Email:</span> {selectedReport.user_email}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-900 whitespace-pre-line">{selectedReport.description}</p>
                </div>

                {/* Attachment */}
                {selectedReport.attachment && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Attachment</h4>
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
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Related Listing</h4>
                      <p className="text-sm text-gray-600">Listing ID: {selectedReport.listing_id}</p>
                    </div>
                  )}

                  {selectedReport.conversation_id && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Related Conversation</h4>
                      <p className="text-sm text-gray-600">Conversation ID: {selectedReport.conversation_id}</p>
                    </div>
                  )}

                  {selectedReport.target_user_id && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Reported User</h4>
                      <p className="text-sm text-gray-600">User ID: {selectedReport.target_user_id}</p>
                    </div>
                  )}
                </div>

                {/* Admin Response */}
                {selectedReport.admin_notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Admin Response</h4>
                        <p className="text-sm text-blue-800">{selectedReport.admin_notes}</p>
                        {selectedReport.reviewed_by_name && (
                          <p className="text-xs text-blue-600 mt-2">
                            Reviewed by {selectedReport.reviewed_by_name} on {formatDate(selectedReport.reviewed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Close
                  </button>
                  {selectedReport.status !== 'resolved' && (
                    <button className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={2000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DisputesReports;
