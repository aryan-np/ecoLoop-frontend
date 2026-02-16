import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Try to get dashboard stats, but fallback to users count if not available
      let statsData = await adminAPI.getDashboardStats();
      
      // If stats endpoint doesn't return total_users, get it from users list
      if (!statsData.total_users) {
        const users = await adminAPI.getUsers();
        statsData.total_users = users.length;
        
        // Calculate total listings from users
        const totalListings = users.reduce((acc, user) => {
          const listing = user.listing || {};
          return acc + (listing.products_count || 0) + (listing.donations_count || 0) + (listing.recycles_count || 0);
        }, 0);
        statsData.active_listings = totalListings;
      }
      
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Try to at least get user count
      try {
        const users = await adminAPI.getUsers();
        const totalListings = users.reduce((acc, user) => {
          const listing = user.listing || {};
          return acc + (listing.products_count || 0) + (listing.donations_count || 0) + (listing.recycles_count || 0);
        }, 0);
        
        setStats({
          total_users: users.length,
          active_listings: totalListings,
          pending_reports: 0,
          total_transactions: 0
        });
      } catch (err) {
        setStats({
          total_users: 0,
          active_listings: 0,
          pending_reports: 0,
          total_transactions: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.total_users || '0'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-blue-500"
        />
        <StatCard
          title="Active Listings"
          value={stats?.active_listings || '0'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          color="bg-green-500"
        />
        <StatCard
          title="Pending Reports"
          value={stats?.pending_reports || '0'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Transactions"
          value={stats?.total_transactions || '0'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Admin Panel</h2>
        <p className="text-gray-600">
          Manage users, monitor activities, and oversee the ecoLoop platform from this dashboard.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
