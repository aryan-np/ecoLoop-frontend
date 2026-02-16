import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recycleAPI from '../api/recycle';
import Spinner from '../components/Spinner';

export default function RecycleScrap() {
  const navigate = useNavigate();
  const [showAllRates, setShowAllRates] = useState(false);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recycleAPI.getAllRates();
      console.log('Loaded rates:', data); // Debug log
      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading recycle rates:', err);
      const errorMessage = err?.message || 'Failed to load scrap rates. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for specific material types
  const getIcon = (materialType) => {
    const type = materialType.toLowerCase();
    
    // Metal icon (gray)
    if (type.startsWith('metal')) {
      return (
        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
        </svg>
      );
    }
    
    // Plastic icon (blue)
    if (type.startsWith('plastic')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    }
    
    // Paper icon (yellow)
    if (type.startsWith('paper')) {
      return (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    return null;
  };

  // Get background color class based on material type
  const getColorClass = (materialType) => {
    const type = materialType.toLowerCase();
    
    if (type.startsWith('metal')) {
      return 'gray';
    }
    if (type.startsWith('plastic')) {
      return 'blue';
    }
    if (type.startsWith('paper')) {
      return 'yellow';
    }
    return 'gray';
  };

  // Separate rates into main (with icons) and others
  // Find specific items for main display: Plastic, Metal, Paper
  const findMainRate = (keyword) => {
    // First try to find exact match without parentheses
    const exact = rates.find(rate => 
      rate.material_type.toLowerCase() === keyword.toLowerCase()
    );
    if (exact) return exact;
    
    // If not found, look for items starting with the keyword
    return rates.find(rate => 
      rate.material_type.toLowerCase().startsWith(keyword.toLowerCase())
    );
  };

  const plasticRate = findMainRate('Plastic');
  const metalRate = findMainRate('Metal');
  const paperRate = findMainRate('Paper');

  // Create main rates array with only Plastic, Metal, and Paper
  const mainRates = [plasticRate, metalRate, paperRate].filter(Boolean);

  // All other rates go in the expandable section
  const otherRates = rates.filter(rate => 
    rate !== plasticRate && rate !== metalRate && rate !== paperRate
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadRates}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Recycle Scrap</h1>
        <p className="text-gray-600">
          Check current scrap rates and sell your recyclable waste responsibly.
        </p>
      </div>

      {/* Current Scrap Rates */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Current Scrap Rates</h2>
        
        {mainRates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {mainRates.map((rate) => {
              const icon = getIcon(rate.material_type);
              const color = getColorClass(rate.material_type);
              
              return (
                <div
                  key={rate.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    {icon && (
                      <div className={`bg-${color}-100 rounded-lg p-3`}>
                        {icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{rate.material_type}</h3>
                      <p className="text-green-600 font-semibold text-lg">Rs. {rate.rate_per_kg}/kg</p>
                      {rate.description && (
                        <p className="text-xs text-gray-500 mt-1">{rate.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* See All Rates */}
        {otherRates.length > 0 && (
          <>
            <button
              onClick={() => setShowAllRates(!showAllRates)}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition"
            >
              <span>See all rates</span>
              <svg
                className={`w-4 h-4 transition-transform ${showAllRates ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Additional Rates (expandable) */}
            {showAllRates && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {otherRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{rate.material_type}</h4>
                    <p className="text-green-600 font-semibold">Rs. {rate.rate_per_kg}/kg</p>
                    {rate.description && (
                      <p className="text-xs text-gray-500 mt-1">{rate.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="text-sm text-gray-500 mt-4">
          * Rates may vary by condition and location
        </p>
      </div>

      {/* Ready to Recycle Info Box */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="bg-teal-500 rounded-lg p-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Ready to recycle?</h3>
            <p className="text-gray-700">
              Submit a request and we'll arrange a pickup at your convenience.
            </p>
          </div>
        </div>
      </div>

      {/* Sell Your Scrap Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/recycle/submit')}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-lg transition shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sell Your Scrap
        </button>
        <p className="text-gray-600 text-sm mt-4">
          Provide details so a recycler can arrange pickup.
        </p>
      </div>

      {/* Help Button (optional) */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-4 shadow-lg transition">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
