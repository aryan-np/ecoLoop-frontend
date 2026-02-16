import { useState } from 'react';

const Verifications = () => {
  const [activeTab, setActiveTab] = useState('ngos');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const ngoVerifications = [
    {
      id: 1,
      organization: 'Green Nepal Foundation',
      contactPerson: 'Ramesh Adhikari',
      phone: '+977-9841234567',
      address: 'Thamel, Kathmandu',
      submitted: '2026-02-01',
      documents: 'incomplete',
      status: 'pending'
    },
    {
      id: 2,
      organization: 'Eco Warriors Nepal',
      contactPerson: 'Sita Sharma',
      phone: '+977-9856789012',
      address: 'Lalitpur',
      submitted: '2026-01-28',
      documents: 'complete',
      status: 'pending'
    }
  ];

  const recyclerVerifications = [
    {
      id: 3,
      organization: 'RecycleKTM Pvt Ltd',
      contactPerson: 'Anil Thapa',
      phone: '+977-9823456789',
      address: 'Bhaktapur',
      submitted: '2026-02-03',
      documents: 'complete',
      status: 'pending'
    }
  ];

  const currentData = activeTab === 'ngos' ? ngoVerifications : recyclerVerifications;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-teal-600 font-medium">Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
        <p className="text-gray-600 mt-1">Review and approve NGO and Recycler verification requests</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('ngos')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'ngos'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              NGOs
            </button>
            <button
              onClick={() => setActiveTab('recyclers')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'recyclers'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recyclers
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by organization or contact person"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.organization}</div>
                        <div className="text-sm text-gray-500">contact@{item.organization.toLowerCase().replace(/\s+/g, '')}.org</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.contactPerson}</div>
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.submitted}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.documents === 'complete'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.documents === 'complete' ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        Review
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Approve
                      </button>
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Reject
                      </button>
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
            Showing {currentData.length} pending {activeTab === 'ngos' ? 'NGO' : 'Recycler'} verification{currentData.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verifications;
