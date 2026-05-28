import { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import apiClient from '../../api/client';

const SystemLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);

  const fetchLogs = async (url = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (url) {
        // Use provided URL for pagination
        const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
        response = await apiClient(cleanUrl);
      } else {
        // Build filters for initial load
        const filters = {};
        if (actionFilter && actionFilter !== 'all') filters.action = actionFilter;
        if (searchQuery) filters.search = searchQuery;
        response = await adminAPI.getActivityLogs(filters);
      }
      
      // Handle paginated response
      if (response?.results && Array.isArray(response.results)) {
        setLogs(response.results);
        setTotalCount(response.count || response.results.length);
        setNextUrl(response.next || null);
        setPreviousUrl(response.previous || null);
      } else if (Array.isArray(response)) {
        setLogs(response);
        setTotalCount(response.length);
        setNextUrl(null);
        setPreviousUrl(null);
      } else {
        setLogs([]);
        setTotalCount(0);
        setNextUrl(null);
        setPreviousUrl(null);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load system logs. Please try again.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextUrl) {
      setCurrentPage(prev => prev + 1);
      fetchLogs(nextUrl);
    }
  };

  const handlePreviousPage = () => {
    if (previousUrl) {
      setCurrentPage(prev => prev - 1);
      fetchLogs(previousUrl);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      setNextUrl(null);
      setPreviousUrl(null);
      fetchLogs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [actionFilter, searchQuery]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Logs</h1>
        <p className="text-gray-600">Audit trail of admin actions and system events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative md:w-4/5">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="md:w-1/5 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="user_blocked">Blocked User</option>
              <option value="user_unblocked">Unblocked User</option>
              <option value="user_role_changed">Changed User Role</option>
              <option value="application_approved">Approved Role Application</option>
              <option value="application_rejected">Rejected Role Application</option>
              <option value="listing_removed">Removed Listing</option>
              <option value="listing_restored">Restored Listing</option>
              <option value="report_resolved">Resolved Report</option>
              <option value="dispute_resolved">Resolved Dispute</option>
              <option value="other">Other Action</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-600">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-red-600">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>{error}</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.admin_name || 'N/A'}</div>
                      {log.admin_email && (
                        <div className="text-xs text-gray-500">{log.admin_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {log.action_display || log.action || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{log.target_name || 'N/A'}</div>
                      {log.target_type && (
                        <div className="text-xs text-gray-500">
                          {log.target_type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.reason || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-900">
              <strong>Security Notice:</strong> System logs are retained for 90 days for audit purposes. All admin actions are logged and monitored for compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stats */}
          <p className="text-sm text-gray-600">
            Showing {logs.length} entries from page {currentPage} (Total: {totalCount})
          </p>

          {/* Pagination Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={!previousUrl || loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                previousUrl && !loading
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!nextUrl || loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                nextUrl && !loading
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
