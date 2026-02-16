import { useState } from 'react';

const DisputesReports = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');

  const disputes = [
    {
      id: 1,
      type: 'Fake Item',
      title: 'Item condition misrepresented',
      reportedUser: 'Anil Thapa',
      related: 'Listing',
      severity: 'High',
      date: '2026-02-05',
      status: 'open'
    },
    {
      id: 2,
      type: 'Fraud',
      title: 'Payment scam attempt',
      reportedUser: 'Bikash Rai',
      related: 'Listing',
      severity: 'High',
      date: '2026-02-04',
      status: 'open'
    },
    {
      id: 3,
      type: 'Spam',
      title: 'Multiple duplicate listings',
      reportedUser: 'Priya Shah',
      related: 'User',
      severity: 'Medium',
      date: '2026-02-03',
      status: 'in-review'
    },
    {
      id: 4,
      type: 'Harassment',
      title: 'Abusive messages in chat',
      reportedUser: 'Rajan KC',
      related: 'Message',
      severity: 'High',
      date: '2026-02-02',
      status: 'resolved'
    }
  ];

  const filteredDisputes = disputes.filter(d => d.status === activeTab);

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
              onClick={() => setActiveTab('open')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'open'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab('in-review')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'in-review'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              In Review
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'resolved'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Resolved
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Related
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
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
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700">
                      {dispute.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{dispute.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{dispute.reportedUser}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {dispute.related}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dispute.severity === 'High'
                        ? 'bg-red-100 text-red-800'
                        : dispute.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {dispute.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dispute.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        View
                      </button>
                      {dispute.status !== 'resolved' && (
                        <>
                          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            Assign
                          </button>
                          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredDisputes.length} {activeTab.replace('-', ' ')} report{filteredDisputes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisputesReports;
