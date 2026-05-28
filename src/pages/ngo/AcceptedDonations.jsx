import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import donationAPI from '../../api/donation';
import Spinner from '../../components/Spinner';
import MapPreview from '../../components/MapPreview';
import Toast from '../../components/Toast';
import { getErrorMessage } from '../../utils/errorHandler';

export default function AcceptedDonations() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [completingId, setCompletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofNotes, setProofNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await donationAPI.getNGOAcceptedRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading accepted donations:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('clothes') || name.includes('clothing')) {
      return 'text-purple-600 bg-purple-100';
    }
    if (name.includes('food')) {
      return 'text-green-600 bg-green-100';
    }
    if (name.includes('book')) {
      return 'text-blue-600 bg-blue-100';
    }
    if (name.includes('furniture')) {
      return 'text-amber-600 bg-amber-100';
    }
    if (name.includes('electronics')) {
      return 'text-gray-600 bg-gray-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPickupDateFromOffers = (offers) => {
    if (offers && offers.length > 0) {
      return offers[0].pickup_date;
    }
    return null;
  };

  const filteredRequests = requests.filter(request => {
    const userName = request.user_details?.full_name?.toLowerCase() || '';
    const address = request.pickup_address?.toLowerCase() || '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || address.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const startPickup = (requestId) => {
    navigate(`/ngo/navigate-pickup/${requestId}`);
  };

  const handleCompletePickup = async (requestId) => {
    const confirmed = window.confirm('Mark this accepted donation pickup as completed?');
    if (!confirmed) return;

    setSelectedRequestId(requestId);
    setProofFile(null);
    setProofNotes('');
    setShowProofModal(true);
  };

  const submitCompletionWithProof = async () => {
    if (!selectedRequestId) return;
    if (!proofFile) {
      setToast({
        type: 'error',
        message: 'Photo proof is required before completing this donation pickup.',
        key: Date.now(),
      });
      return;
    }

    try {
      setCompletingId(selectedRequestId);

      const formData = new FormData();
      formData.append('photo_proof', proofFile);
      if (proofNotes.trim()) {
        formData.append('notes', proofNotes.trim());
      }

      await donationAPI.completeNGOAcceptedRequest(selectedRequestId, formData);
      setRequests((prev) => prev.filter((request) => request.id !== selectedRequestId));
      setShowProofModal(false);
      setSelectedRequestId(null);
      setProofFile(null);
      setProofNotes('');
      setToast({ type: 'success', message: 'Donation pickup marked as completed.', key: Date.now() });
    } catch (err) {
      console.error('Error completing accepted donation:', err);
      setToast({
        type: 'error',
        message: getErrorMessage(err, 'Failed to complete pickup. Please try again.'),
        key: Date.now(),
      });
    } finally {
      setCompletingId(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Accepted Donations</h1>
        <p className="text-gray-600 mt-2">Manage your accepted donation pickups</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <div className="relative">
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
          </div>

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

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No accepted donations</p>
          <p className="text-gray-400 text-sm mt-2">Accept donation requests to see them here</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const imageUrl = request.images && request.images.length > 0 ? request.images[0].image : null;
            const pickupDate = getPickupDateFromOffers(request.ngo_offers);

            return (
              <div key={request.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 bg-gray-200 flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Donation" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {request.user_details?.full_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(request.category_details?.name)}`}>
                            {request.category_details?.name}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            Accepted
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Request #{request.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-semibold">{request.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-semibold">{request.condition_details?.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span className="text-gray-600 flex-shrink-0">Location:</span>
                          <span className="font-medium">{request.pickup_address}</span>
                        </div>
                        {pickupDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                            <span className="text-gray-600">Pickup:</span>
                            <span className="font-semibold">{formatDate(pickupDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          {request.user_details?.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                          {request.user_details?.phone_number}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCompletePickup(request.id)}
                          disabled={completingId === request.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completingId === request.id ? 'Completing...' : 'Complete Pickup'}
                        </button>
                        <button
                          onClick={() => startPickup(request.id)}
                          disabled={completingId === request.id}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Start Pickup
                        </button>
                      </div>
                    </div>

                    {request.latitude && request.longitude && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Pickup Location</h4>
                        <div className="rounded-lg overflow-hidden">
                          <MapPreview latitude={request.latitude} longitude={request.longitude} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
            const imageUrl = request.images && request.images.length > 0 ? request.images[0].image : null;
            const pickupDate = getPickupDateFromOffers(request.ngo_offers);

            return (
              <div key={request.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Donation" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {request.user_details?.full_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(request.category_details?.name)}`}>
                        {request.category_details?.name}
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        Accepted
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{request.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-semibold">{request.condition_details?.name}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-gray-700 truncate">{request.pickup_address}</span>
                    </div>
                    {pickupDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                        <span className="text-gray-700 text-xs">{formatDate(pickupDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCompletePickup(request.id)}
                      disabled={completingId === request.id}
                      className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completingId === request.id ? 'Completing...' : 'Complete'}
                    </button>
                    <button
                      onClick={() => startPickup(request.id)}
                      disabled={completingId === request.id}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start
                    </button>
                  </div>

                  {request.latitude && request.longitude && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Location</h4>
                      <div className="rounded-lg overflow-hidden">
                        <MapPreview latitude={request.latitude} longitude={request.longitude} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast
          key={toast.key}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Upload Photo Proof</h2>
                <button
                  onClick={() => {
                    if (completingId) return;
                    setShowProofModal(false);
                    setSelectedRequestId(null);
                    setProofFile(null);
                    setProofNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Upload the NGO completion photo proof required by the backend before marking this donation pickup as completed.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm border border-gray-300 rounded-lg p-2"
                    disabled={!!completingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add any completion notes..."
                    disabled={!!completingId}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (completingId) return;
                    setShowProofModal(false);
                    setSelectedRequestId(null);
                    setProofFile(null);
                    setProofNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={!!completingId}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitCompletionWithProof}
                  disabled={!!completingId}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {completingId ? 'Uploading...' : 'Upload & Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
