import React, { useState, useEffect } from 'react';

const NGODashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 248,
    activeRequests: 15,
    categories: 12,
    totalItems: 1567
  });

  const [recentRequests, setRecentRequests] = useState([
    { id: 1, name: 'Anita Thapa', category: 'Clothing', quantity: '20 items', status: 'requested' },
    { id: 2, name: 'Bijay Sharma', category: 'Books', quantity: '50 books', status: 'approved' },
    { id: 3, name: 'Maya Gurung', category: 'Furniture', quantity: '5 items', status: 'picked_up' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested':
        return 'bg-orange-100 text-orange-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'picked_up':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'requested':
        return 'Requested';
      case 'approved':
        return 'Approved';
      case 'picked_up':
        return 'Picked Up';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Donations</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Requests</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H4A2,2 0 0,0 2,10V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V10A2,2 0 0,0 20,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6Z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeRequests}</p>
          <p className="text-sm text-gray-500 mt-1">Pending action</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Categories</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,19V15H15V19H21V9H15V5H9V9H3V19H9M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.categories}</p>
          <p className="text-sm text-gray-500 mt-1">Received types</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
          <p className="text-sm text-gray-500 mt-1">Received</p>
        </div>
      </div>

      {/* Recent Donation Requests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Donation Requests</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentRequests.map((request) => (
            <div key={request.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
              <div>
                <h3 className="font-semibold text-gray-900">{request.name}</h3>
                <p className="text-sm text-gray-600">{request.category} • {request.quantity}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusText(request.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
