import { useState } from 'react';

const SystemLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const logs = [
    {
      id: 1,
      timestamp: '2026-02-05 14:23:15',
      admin: 'Admin User',
      action: 'Blocked user',
      targetEntity: 'User: Anil Thapa (ID: 1234)',
      result: 'Success',
      details: 'Reason: Multiple reports of fraudulent activity'
    },
    {
      id: 2,
      timestamp: '2026-02-05 13:15:42',
      admin: 'Admin User',
      action: 'Approved NGO',
      targetEntity: 'NGO: Green Nepal Foundation (ID: 5678)',
      result: 'Success',
      details: 'All verification documents approved'
    },
    {
      id: 3,
      timestamp: '2026-02-05 11:28:33',
      admin: 'Admin User',
      action: 'Removed listing',
      targetEntity: 'Listing: Prohibited item (ID: 9012)',
      result: 'Success',
      details: 'Violated platform policies'
    },
    {
      id: 4,
      timestamp: '2026-02-05 10:45:21',
      admin: 'Admin User',
      action: 'Changed user role',
      targetEntity: 'User: Sita Sharma (ID: 3456)',
      result: 'Success',
      details: 'Changed from Buyer to Seller'
    },
    {
      id: 5,
      timestamp: '2026-02-05 09:12:08',
      admin: 'Admin User',
      action: 'Rejected verification',
      targetEntity: 'Recycler: Fake Company (ID: 7890)',
      result: 'Success',
      details: 'Incomplete documentation'
    },
    {
      id: 6,
      timestamp: '2026-02-04 16:53:33',
      admin: 'Admin User',
      action: 'Resolved dispute',
      targetEntity: 'Dispute: Case #2345',
      result: 'Success',
      details: 'Refund processed to buyer'
    },
    {
      id: 7,
      timestamp: '2026-02-04 15:20:17',
      admin: 'Admin User',
      action: 'Unblocked user',
      targetEntity: 'User: Maya Poudel (ID: 4567)',
      result: 'Success',
      details: 'Appeal accepted after review'
    },
    {
      id: 8,
      timestamp: '2026-02-04 14:08:45',
      admin: 'Admin User',
      action: 'Updated settings',
      targetEntity: 'System Settings',
      result: 'Failed',
      details: 'Permission denied - insufficient privileges'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-teal-600 font-medium">Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600 mt-1">Audit trail of admin actions and system events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="blocked">Blocked user</option>
              <option value="approved">Approved NGO</option>
              <option value="removed">Removed listing</option>
              <option value="changed">Changed user role</option>
              <option value="resolved">Resolved dispute</option>
            </select>

            {/* Result Filter */}
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
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
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.admin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.targetEntity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.result === 'Success' ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${
                        log.result === 'Success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details}
                  </td>
                </tr>
              ))}
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

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-sm text-gray-600">
          Showing {logs.length} of 8 log entries
        </p>
      </div>
    </div>
  );
};

export default SystemLogs;
