import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DonateItems() {
  const navigate = useNavigate();

  const donationCategories = [
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      label: 'Clothes',
      bgColor: 'bg-purple-50'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'Books',
      bgColor: 'bg-purple-50'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Electronics',
      bgColor: 'bg-purple-50'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Household Items',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Donate Items</h1>
        <p className="text-gray-600">
          Give items a second life by donating to verified NGOs.
        </p>
      </div>

      {/* Hero Image */}
      <div className="mb-12 rounded-lg overflow-hidden h-64 bg-gray-200">
        <img
          src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&h=400&fit=crop"
          alt="Donation items"
          className="w-full h-full object-cover"
        />
      </div>

      {/* What You Can Donate */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">What You Can Donate</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {donationCategories.map((category, index) => (
            <div
              key={index}
              className={`${category.bgColor} rounded-lg p-6 text-center`}
            >
              <div className="flex justify-center mb-3">
                {category.icon}
              </div>
              <p className="font-medium text-gray-900">{category.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Message */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="bg-purple-500 rounded-lg p-2 mt-1">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              Make a meaningful impact
            </h3>
            <p className="text-gray-700">
              Your donations go directly to verified NGOs and community organizations serving Kathmandu Valley.
            </p>
          </div>
        </div>
      </div>

      {/* Donate Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/donate/form')}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Donate Something Meaningful
        </button>
        <p className="text-gray-600 text-sm mt-4">
          You'll choose the item category in the next step.
        </p>
      </div>
    </div>
  );
}
