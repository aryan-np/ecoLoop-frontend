import { useState, useEffect } from "react";
import analyticsAPI from "../../api/analytics";

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
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

export default function RecyclerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const d = await analyticsAPI.getRecyclerImpact();
        if (isMounted) setData(d);
      } catch (err) {
        if (isMounted) setError(err?.ErrorMessage?.[0] || err?.message || "Failed to load recycler impact.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading recycler impact...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

  const weightByCategory = data?.weight_by_category ?? [];
  const monthlyPickups = data?.monthly_pickups_chart ?? [];
  const max = Math.max(...monthlyPickups.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recycler Dashboard</h1>

      {/* Banner */}
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">Recycling for a Greener Future!</p>
          <p className="text-sm text-gray-500">Track your pickups, collected weight, and estimated earnings.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pickups Completed"
          value={data?.total_pickups_completed ?? 0}
          bg="bg-teal-50"
          iconColor="text-teal-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Weight Collected"
          value={`${data?.total_weight_collected_kg ?? 0} kg`}
          bg="bg-green-50"
          iconColor="text-green-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
        />
        <StatCard
          label="CO₂ Saved"
          value={`${data?.total_co2_saved_kg ?? 0} kg`}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          }
        />
        <StatCard
          label="Est. Earnings"
          value={`Rs. ${data?.estimated_earnings ?? 0}`}
          bg="bg-yellow-50"
          iconColor="text-yellow-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Weight by Category + Users Served */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SectionCard
          title="Weight by Category"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        >
          {weightByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {weightByCategory.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{cat.category}</span>
                    <span className="text-sm text-gray-500">{cat.weight_kg} kg ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Top Category & Users"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Top Scrap Category</p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{data?.top_scrap_category ?? "—"}</span>
                <span className="text-sm bg-teal-100 text-teal-700 px-3 py-0.5 rounded-full font-semibold">
                  {data?.top_scrap_category_percentage ?? 0}%
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Unique Users Served</p>
              <p className="text-2xl font-bold text-green-600">{data?.total_unique_users_served ?? 0}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Monthly Pickups Chart */}
      <SectionCard
        title="Monthly Pickups"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        {monthlyPickups.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {monthlyPickups.map((row) => (
              <div key={row.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{row.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-teal-400 h-3 rounded-full" style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-20 text-right">{row.count} pickups</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
