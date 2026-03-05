import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import donationAPI from '../../api/donation';
import Spinner from '../../components/Spinner';

export default function DonationRequests() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  useEffect(() => {
    loadCategories();
    loadRequests();
  }, []);

  useEffect(() => {
    // Reload requests when filters change (except search term which is frontend-only)
    loadRequests();
  }, [categoryFilter, conditionFilter]);

  const loadCategories = async () => {
    try {
      const data = await donationAPI.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const filters = {
        category: categoryFilter,
        condition: conditionFilter
      };
      const data = await donationAPI.getNGOPendingRequests(filters);
      console.log('Loaded donation requests:', data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading donation requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('clothes') || name.includes('clothing')) {
      return 'text-purple-600';
    }
    if (name.includes('food')) {
      return 'text-green-600';
    }
    if (name.includes('book')) {
      return 'text-blue-600';
    }
    if (name.includes('furniture')) {
      return 'text-amber-600';
    }
    if (name.includes('electronics')) {
      return 'text-gray-600';
    }
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const filteredRequests = requests.filter(request => {
    const userName = request.user_details?.full_name?.toLowerCase() || '';
    const address = request.pickup_address?.toLowerCase() || '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || address.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[600px] bg-gray-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donation Requests</h1>
        <p className="text-gray-600 mt-2">Manage and track all incoming donation requests</p>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by user name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Conditions</option>
              <option value="1">Good</option>
              <option value="2">Fair</option>
              <option value="3">Poor</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Requests Grid/List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 text-lg">No donation requests found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredRequests.map((request) => {
            const imageUrl = request.images && request.images.length > 0 
              ? request.images[0].image 
              : null;
            const categoryName = request.category_details?.name || 'Unknown';
            const userName = request.user_details?.full_name || 'Unknown User';
            const conditionName = request.condition_details?.name || 'Unknown';
            
            return (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                {imageUrl ? (
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-purple-500 text-sm">No image available</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {userName}
                      </h3>
                      <p className={`text-base font-semibold mt-1 ${getCategoryColor(categoryName)}`}>
                        {categoryName}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">ID: #{request.id}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 mb-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                      </svg>
                      <span className="text-sm">
                        Quantity: <span className="font-semibold">{request.quantity}</span>
                      </span>
                    </div>

                    {/* Condition */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="text-sm">
                        Condition: <span className="font-semibold">{conditionName}</span>
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-sm truncate">{request.pickup_address}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Posted on {formatDate(request.request_date)}
                    </span>
                    <button 
                      onClick={() => navigate(`/ngo/donation-requests/${request.id}`)}
                      className="px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
