import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recycleAPI from '../../api/recycle';

const formatCompletedDate = (value) => {
  if (!value) return 'Completed —';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `Completed ${value}`;
  return `Completed ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};

const getPickupDateFromOffers = (offers) => {
  if (Array.isArray(offers) && offers.length > 0) {
    return offers[0]?.pickup_date || null;
  }
  return null;
};

const getCompletedAt = (request) => {
  return (
    request?.completed_at ||
    request?.completion_date ||
    request?.updated_at ||
    getPickupDateFromOffers(request?.recycler_offers)
  );
};

const getMaterialLabel = (materialType) => {
  const type = materialType?.toLowerCase() || '';
  if (type.includes('metal') || type.includes('aluminum') || type.includes('copper') || type.includes('iron') || type.includes('steel')) {
    return 'Metal';
  }
  if (type.includes('plastic')) {
    return 'Plastic';
  }
  if (type.includes('paper')) {
    return 'Paper';
  }
  if (type.includes('glass')) {
    return 'Glass';
  }
  return materialType || 'Material';
};

export default function CompletedPickups() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const loadCompletedPickups = async () => {
      try {
        setLoading(true);
        const data = await recycleAPI.getCompletedRequests();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompletedPickups();
  }, []);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const bySearch = requests.filter((request) => {
      const material = request?.category_details?.material_type?.toLowerCase() || '';
      const userName = request?.user_details?.full_name?.toLowerCase() || '';
      const address = request?.pickup_address?.toLowerCase() || '';

      if (!search) return true;
      return material.includes(search) || userName.includes(search) || address.includes(search);
    });

    if (timeFilter === 'all') {
      return bySearch;
    }

    const now = new Date();
    return bySearch.filter((request) => {
      const completedAt = getCompletedAt(request);
      if (!completedAt) return false;

      const completedDate = new Date(completedAt);
      if (Number.isNaN(completedDate.getTime())) return false;

      const daysDiff = (now - completedDate) / (1000 * 60 * 60 * 24);

      if (timeFilter === 'month') return daysDiff <= 30;
      if (timeFilter === '3months') return daysDiff <= 90;
      if (timeFilter === 'year') return daysDiff <= 365;
      return true;
    });
  }, [requests, searchTerm, timeFilter]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 min-h-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-600">
          Loading completed pickups...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Completed Pickups</h1>
        <p className="text-gray-600 mt-2">All your fulfilled pickups in one place</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pickups..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-xl text-gray-600">No completed pickups found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((request) => {
            const imageUrl = request?.images?.[0]?.image || null;
            const materialType = request?.category_details?.material_type || 'Material';
            const materialLabel = getMaterialLabel(materialType);
            const weight = request?.weight_kg ? `${request.weight_kg} kg` : '—';
            const userName = request?.user_details?.full_name || 'Unknown User';
            const address = request?.pickup_address || 'Unknown location';
            const completedDate = getCompletedAt(request);
            const offeredPrice = request?.recycler_offers?.[0]?.offered_price;

            return (
              <div key={request.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-60 h-48 bg-gray-200 flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={materialType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{materialType}</h3>
                        <p className="text-green-600 font-semibold mt-2 text-lg">{materialLabel} · {weight}</p>
                      </div>

                      <div className="flex items-center gap-6 md:pt-2">
                        {offeredPrice && (
                          <div className="text-right">
                            <p className="text-xl md:text-2xl font-bold text-teal-600">NPR {Number(offeredPrice).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Offered Price</p>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 font-semibold border border-green-200">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.06 14.12l-3.18-3.18 1.41-1.41 1.77 1.77 4.89-4.89 1.41 1.41-6.3 6.3z" />
                          </svg>
                          Completed
                        </span>
                        <button
                          onClick={() => navigate(`/recycler/scrap-requests/${request.id}`)}
                          className="inline-flex items-center gap-1.5 text-green-700 font-semibold hover:text-green-800 transition"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-gray-700">
                      <div className="inline-flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM19 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-base font-medium">{userName}</span>
                      </div>

                      <div className="inline-flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-base font-medium">{address}</span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base font-medium">{formatCompletedDate(completedDate)}</span>
                      </div>
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
