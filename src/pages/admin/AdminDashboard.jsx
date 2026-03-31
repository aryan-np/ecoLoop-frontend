import { useState, useEffect } from "react";
import analyticsAPI from "../../api/analytics";

function StatCard({ label, value, bg, iconColor, icon }) {
  return (
    <div className={`${bg} border border-gray-100 rounded-xl p-5`}>
      <div className={`${iconColor} mb-3`}>{icon}</div>
      <p className={`text-2xl font-bold ${iconColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const d = await analyticsAPI.getAdminImpact();
        if (isMounted) setData(d);
      } catch (err) {
        if (isMounted) setError(err?.ErrorMessage?.[0] || err?.message || "Failed to load admin impact.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading admin impact...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

  const totals = data?.platform_totals ?? {};
  const users = data?.active_users ?? {};
  const disputes = data?.dispute_stats ?? {};
  const monthlyActivity = data?.monthly_activity_chart ?? [];
  const newRegs = data?.new_registrations_chart ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">Platform Overview</p>
          <p className="text-sm text-gray-500">Monitor all activity, users, and environmental impact across ecoLoop.</p>
        </div>
      </div>

      {/* Platform Totals */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Platform Totals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Items Sold"
          value={totals.items_sold ?? 0}
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
          value={totals.items_donated ?? 0}
          bg="bg-purple-50"
          iconColor="text-purple-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
        <StatCard
          label="Items Recycled"
          value={`${totals.items_recycled_kg ?? 0} kg`}
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
          value={`${totals.co2_saved_kg ?? 0} kg`}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          }
        />
      </div>

      {/* Active Users + Dispute Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SectionCard
          title="Active Users"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-3">
            {[
              { label: "Total Users", value: users.total_users ?? 0, color: "bg-blue-100 text-blue-700" },
              { label: "Total Recyclers", value: users.total_recyclers ?? 0, color: "bg-teal-100 text-teal-700" },
              { label: "Total NGOs", value: users.total_ngos ?? 0, color: "bg-purple-100 text-purple-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-semibold px-3 py-0.5 rounded-full ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Dispute Stats"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        >
          <div className="space-y-3">
            {[
              { label: "Total Reports", value: disputes.total_reports ?? 0, color: "bg-red-100 text-red-700" },
              { label: "Resolved Reports", value: disputes.resolved_reports ?? 0, color: "bg-green-100 text-green-700" },
              { label: "Resolution Rate", value: `${disputes.resolution_rate ?? 0}%`, color: "bg-yellow-100 text-yellow-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-semibold px-3 py-0.5 rounded-full ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top Recycler + Top NGO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SectionCard
          title="Top Recycler"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          {data?.top_recycler ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">#1</span>
                <span className="font-medium text-gray-800">{data.top_recycler.name}</span>
              </div>
              <span className="text-sm text-gray-500">{data.top_recycler.metric_value} kg</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">No data yet.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Top NGO"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        >
          {data?.top_ngo ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">#1</span>
                <span className="font-medium text-gray-800">{data.top_ngo.name}</span>
              </div>
              <span className="text-sm text-gray-500">{data.top_ngo.metric_value} donations</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">No data yet.</p>
          )}
        </SectionCard>
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          title="Monthly Activity"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        >
          <MonthlyChart data={monthlyActivity} color="bg-blue-400" unit="activities" />
        </SectionCard>

        <SectionCard
          title="New Registrations"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        >
          <MonthlyChart data={newRegs} color="bg-green-400" unit="users" />
        </SectionCard>
      </div>
    </div>
  );
}

function MonthlyChart({ data, color, unit }) {
  if (!data.length) return <p className="text-sm text-gray-400 text-center py-2">No data yet.</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((row) => (
        <div key={row.month} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 flex-shrink-0">{row.month}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`${color} h-3 rounded-full`}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16 text-right">{row.count} {unit}</span>
        </div>
      ))}
    </div>
  );
}
