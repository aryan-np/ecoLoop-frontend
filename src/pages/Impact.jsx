import React, { useEffect, useState } from "react";
import analyticsAPI from "../api/analytics";

const rankColors = ["bg-yellow-400", "bg-gray-300", "bg-orange-400"];

function RankBadge({ index }) {
  return (
    <span
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${rankColors[index] ?? "bg-gray-200"}`}
    >
      #{index + 1}
    </span>
  );
}

function OrgTypeBadge({ type }) {
  const styles = {
    NGO: "bg-blue-100 text-blue-700",
    RECYCLER: "bg-green-100 text-green-700",
  };
  const labels = {
    NGO: "NGO",
    RECYCLER: "Recycler",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[type] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[type] ?? type}
    </span>
  );
}

export default function Impact() {
  const [userImpact, setUserImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchImpact = async () => {
      setLoading(true);
      setError("");
      try {
        const userData = await analyticsAPI.getUserImpact();
        if (!isMounted) return;
        setUserImpact(userData);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.ErrorMessage?.[0] || err?.message || "Failed to load impact data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImpact();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading impact data...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

  const topDonors = userImpact?.community_highlights?.top_donors ?? [];
  const topRecyclers = userImpact?.community_highlights?.top_recyclers ?? [];
  const partnerNGOs = (userImpact?.partner_organizations?.ngos ?? []).map(o => ({ ...o, org_type: "NGO" }));
  const partnerRecyclers = (userImpact?.partner_organizations?.recyclers ?? []);
  const allPartners = [...partnerNGOs, ...partnerRecyclers];

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Impact</h1>

      {/* Banner */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">Making a Difference!</p>
          <p className="text-sm text-gray-500">You have helped reduce waste and support sustainability in Kathmandu Valley.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Items Sold"
          value={userImpact?.items_sold ?? 0}
          bg="bg-green-50"
          iconColor="text-green-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Items Donated"
          value={userImpact?.items_donated ?? 0}
          bg="bg-purple-50"
          iconColor="text-purple-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H5.45a4 4 0 00-3.95 4.55L3 17a2 2 0 002 2h14a2 2 0 002-2l1.5-12.45A4 4 0 0018.55 2H16a4 4 0 00-4 4v2z" />
            </svg>
          }
        />
        <StatCard
          label="Scrap Recycled"
          value={`${userImpact?.scrap_recycled_kg ?? 0} kg`}
          bg="bg-teal-50"
          iconColor="text-teal-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        />
        <StatCard
          label="CO₂ Saved"
          value={`${userImpact?.co2_saved_kg ?? 0} kg`}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          }
        />
      </div>

      {/* Community Highlights */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Top Donors */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H5.45a4 4 0 00-3.95 4.55L3 17a2 2 0 002 2h14a2 2 0 002-2l1.5-12.45A4 4 0 0018.55 2H16a4 4 0 00-4 4v2z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Top Donors</h3>
          </div>
          {topDonors.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No donors yet.</p>
          ) : (
            <div className="space-y-3">
              {topDonors.map((donor, i) => (
                <div key={donor.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RankBadge index={i} />
                    <span className="text-sm font-medium text-gray-800">{donor.full_name}</span>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">{donor.total_donations} items</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Recyclers */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="font-semibold text-gray-900">Top Recyclers</h3>
          </div>
          {topRecyclers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No recyclers yet.</p>
          ) : (
            <div className="space-y-3">
              {topRecyclers.map((recycler, i) => (
                <div key={recycler.recycler_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RankBadge index={i} />
                    <span className="text-sm font-medium text-gray-800">{recycler.full_name}</span>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">{recycler.total_weight_kg} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Partner Organizations */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900">Partner Organizations</h3>
        </div>
        {allPartners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No partner organizations yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allPartners.map((org) => (
              <div key={org.id} className="border border-gray-100 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-1">{org.name}</p>
                <OrgTypeBadge type={org.org_type} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, bg, iconColor, icon }) {
  return (
    <div className={`${bg} border border-gray-100 rounded-xl p-5`}>
      <div className={`${iconColor} mb-3`}>{icon}</div>
      <p className={`text-2xl font-bold ${iconColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
