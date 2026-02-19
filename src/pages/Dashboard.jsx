import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "../components/Toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Show login success toast if coming from login page
    if (location.state?.loginSuccess) {
      setToast({ type: "success", message: "Login successful!", key: Date.now() });
    }
  }, [location.state?.loginSuccess]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ecoLoop</h1>
        <p className="text-gray-600">Choose what you'd like to do today</p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Buy Card */}
        <div
          onClick={() => navigate("/products")}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6 cursor-pointer hover:shadow-lg hover:border-blue-400 transition transform hover:scale-105"
        >
          <div className="text-4xl mb-3 bg-blue-500 text-white p-3 rounded-lg w-fit">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Buy Items</h2>
          <p className="text-sm text-gray-600 mb-4">Browse products for reuse. Shop from verified sellers.</p>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
            Start Browsing
          </button>
        </div>

        {/* Sell Card */}
        <div
          onClick={() => navigate("/products/new")}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 p-6 cursor-pointer hover:shadow-lg hover:border-green-400 transition transform hover:scale-105"
        >
          <div className="text-4xl mb-3 bg-green-500 text-white p-3 rounded-lg w-fit">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sell Items</h2>
          <p className="text-sm text-gray-600 mb-4">List items and earn money while reducing waste.</p>
          <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition">
            List Your Item
          </button>
        </div>

        {/* Recycle Card */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border-2 border-teal-300 p-6 cursor-pointer hover:shadow-lg hover:border-teal-400 transition transform hover:scale-105">
          <div className="text-4xl mb-3 bg-teal-500 text-white p-3 rounded-lg w-fit">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Recycle Scrap</h2>
          <p className="text-sm text-gray-600 mb-4">Submit recyclables for a sustainable environment.</p>
          <button className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition">
            Recycle Now
          </button>
        </div>

        {/* Donate Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 p-6 cursor-pointer hover:shadow-lg hover:border-purple-400 transition transform hover:scale-105">
          <div className="text-4xl mb-3 bg-purple-500 text-white p-3 rounded-lg w-fit">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Donate Items</h2>
          <p className="text-sm text-gray-600 mb-4">Give away items and help your community.</p>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
            Donate Today
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">ecoLoop by Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">1000+</p>
            <p className="text-gray-600 font-medium">Items Traded</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-600 mb-2">500+</p>
            <p className="text-gray-600 font-medium">Active Users</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-teal-600 mb-2">2000 kg</p>
            <p className="text-gray-600 font-medium">Waste Reduced</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-600 mb-2">100+</p>
            <p className="text-gray-600 font-medium">Items Donated</p>
          </div>
        </div>
      </div>

      {/* Toast for login success */}
      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
