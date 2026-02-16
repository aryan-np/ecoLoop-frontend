import React from 'react';

export default function Impact() {
  // Static data for now - will be replaced with backend data later
  const impactStats = {
    itemsSold: 0,
    itemsDonated: 0,
    scrapRecycled: 5.0,
    co2Saved: 12.5
  };

  const topDonors = [
    { rank: 1, name: 'Sita Sharma', items: 15, verified: true },
    { rank: 2, name: 'Ram Thapa', items: 12, verified: true },
    { rank: 3, name: 'Maya Gurung', items: 10, verified: false }
  ];

  const topRecyclers = [
    { rank: 1, name: 'Kiran Rai', kg: 45.2, verified: true },
    { rank: 2, name: 'Rajesh Kumar', kg: 38.5, verified: true },
    { rank: 3, name: 'Anita Shrestha', kg: 32.0, verified: true }
  ];

  const partnerOrganizations = [
    { name: 'Green Nepal NGO', type: 'NGO' },
    { name: 'Eco Solutions Pvt. Ltd.', type: 'Company' },
    { name: 'Kathmandu Recycling Center', type: 'Partner' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Impact</h1>

      {/* Making a Difference Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start gap-4">
        <div className="bg-green-500 rounded-full p-3">
          <svg className="text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Making a Difference!
          </h2>
          <p className="text-gray-600">
            You have helped reduce waste and support sustainability in Kathmandu Valley.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Items Sold */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <svg className="text-green-600 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">
              {impactStats.itemsSold}
            </p>
            <p className="text-gray-600 font-medium">Items Sold</p>
          </div>
        </div>

        {/* Items Donated */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="text-purple-600 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {impactStats.itemsDonated}
            </p>
            <p className="text-gray-600 font-medium">Items Donated</p>
          </div>
        </div>

        {/* Scrap Recycled */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-100 rounded-full p-3">
              <svg className="text-teal-600 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-teal-600 mb-2">
              {impactStats.scrapRecycled} kg
            </p>
            <p className="text-gray-600 font-medium">Scrap Recycled</p>
          </div>
        </div>

        {/* CO2 Saved */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="text-blue-600 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              {impactStats.co2Saved} kg
            </p>
            <p className="text-gray-600 font-medium">
              CO<sub>2</sub> Saved
            </p>
          </div>
        </div>
      </div>

      {/* Community Highlights */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Highlights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Top Donors */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="text-purple-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800">Top Donors</h3>
          </div>
          <div className="space-y-4">
            {topDonors.map((donor) => (
              <div 
                key={donor.rank}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                      donor.rank === 1 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : donor.rank === 2 
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    #{donor.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{donor.name}</span>
                    {donor.verified && (
                      <svg className="text-green-500 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 font-medium">{donor.items} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recyclers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="text-teal-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800">Top Recyclers</h3>
          </div>
          <div className="space-y-4">
            {topRecyclers.map((recycler) => (
              <div 
                key={recycler.rank}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                      recycler.rank === 1 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : recycler.rank === 2 
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    #{recycler.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{recycler.name}</span>
                    {recycler.verified && (
                      <svg className="text-green-500 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 font-medium">{recycler.kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Organizations */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="text-blue-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Partner Organizations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partnerOrganizations.map((org, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-800 mb-3">{org.name}</h3>
              <span 
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  org.type === 'NGO' 
                    ? 'bg-blue-100 text-blue-700' 
                    : org.type === 'Company'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {org.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
