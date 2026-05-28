import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recycleAPI from '../../api/recycle';
import Spinner from '../../components/Spinner';

export default function SavedScrapRequests() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingMap, setSavingMap] = useState({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await recycleAPI.getRecyclerSavedRequests();
      const items = Array.isArray(data) ? data : [];
      const normalized = items.map((item) => (
        item?.scrap_request
          ? { ...item.scrap_request, saved_id: item.id }
          : item
      ));
      setRequests(normalized);
    } catch (error) {
      console.error('Error loading saved scrap requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const setSaving = (requestId, isSaving) => {
    setSavingMap((prev) => ({
      ...prev,
      [requestId]: isSaving
    }));
  };

  const handleToggleSave = async (requestId, isSaved) => {
    try {
      setSaving(requestId, true);
      if (isSaved) {
        await recycleAPI.unsaveRecyclerPendingRequest(requestId);
        setRequests((prev) => prev.filter((request) => request.id !== requestId));
      } else {
        await recycleAPI.saveRecyclerPendingRequest(requestId);
        setRequests((prev) => prev.map((request) => (
          request.id === requestId
            ? { ...request, is_saved: true }
            : request
        )));
      }
    } catch (error) {
      console.error('Error toggling saved request:', error);
    } finally {
      setSaving(requestId, false);
    }
  };

  const getCategoryColor = (materialType) => {
    const type = materialType?.toLowerCase() || '';
    if (type.includes('metal') || type.includes('aluminum') || type.includes('copper')) {
      return 'text-gray-600';
    }
    if (type.includes('plastic')) {
      return 'text-blue-600';
    }
    if (type.includes('paper')) {
      return 'text-green-600';
    }
    return 'text-gray-600';
  };

  const getCategoryName = (materialType) => {
    const type = materialType?.toLowerCase() || '';
    if (type.includes('plastic')) return 'Plastic';
    if (type.includes('paper')) return 'Paper';
    if (type.includes('metal') || type.includes('aluminum') || type.includes('copper') || type.includes('iron') || type.includes('steel')) return 'Metal';
    if (type.includes('glass')) return 'Glass';
    return materialType || 'Other';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const filteredRequests = requests.filter((request) => {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Scrap Requests</h1>
        <p className="text-gray-600 mt-2">Review the scrap requests you have saved</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
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
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-teal-600 text-white'
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
                  ? 'bg-teal-600 text-white'
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

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 text-lg">No saved scrap requests</p>
          <p className="text-gray-400 text-sm mt-2">Save a request to see it here</p>
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
            const categoryName = getCategoryName(request.category_details?.material_type);
            const userName = request.user_details?.full_name || 'Unknown User';

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {imageUrl ? (
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No image available</p>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {userName}
                      </h3>
                      <p className={`text-base font-semibold mt-1 ${getCategoryColor(request.category_details?.material_type)}`}>
                        {categoryName}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">ID: #{request.id}</span>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                      </svg>
                      <span className="text-sm">
                        Estimated: <span className="font-semibold">{request.weight_kg} kg</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-sm truncate">{request.pickup_address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span className="text-sm">
                        Time: <span className="font-semibold capitalize">{request.preferred_time_slot}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Posted on {formatDate(request.request_date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(request.id, true)}
                        disabled={savingMap[request.id]}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg transition border text-teal-700 bg-teal-100 border-teal-200 hover:bg-teal-200 ${
                          savingMap[request.id] ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        title="Unsave request"
                      >
                        Saved
                      </button>
                      <button
                        onClick={() => navigate(`/recycler/scrap-requests/${request.id}`)}
                        className="px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      >
                        View Details →
                      </button>
                    </div>
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
