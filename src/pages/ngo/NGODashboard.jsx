import { useState, useEffect } from "react";
import analyticsAPI from "../../api/analytics";

const rankColors = ["bg-yellow-400", "bg-gray-300", "bg-orange-400"];

function RankBadge({ index }) {
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${rankColors[index] ?? "bg-gray-200"}`}>
      #{index + 1}
    </span>
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

function StatCard({ label, value, bg, iconColor, icon }) {
  return (
    <div className={`${bg} border border-gray-100 rounded-xl p-5`}>
      <div className={`${iconColor} mb-3`}>{icon}</div>
      <p className={`text-2xl font-bold ${iconColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function NGODashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const d = await analyticsAPI.getNgoImpact();
        if (isMounted) setData(d);
      } catch (err) {
        if (isMounted) setError(err?.ErrorMessage?.[0] || err?.message || "Failed to load NGO impact.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading NGO impact...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;

  const donorLeaderboard = data?.donor_leaderboard ?? [];
  const itemsByCategory = data?.items_by_category ?? [];
  const monthlyDonations = data?.monthly_donations_chart ?? [];
  const max = Math.max(...monthlyDonations.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">NGO Dashboard</h1>

      {/* Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">Making an Impact!</p>
          <p className="text-sm text-gray-500">Track donations fulfilled, beneficiaries served, and your top donors.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Donations Fulfilled"
          value={data?.total_donation_requests_fulfilled ?? 0}
          bg="bg-purple-50"
          iconColor="text-purple-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Beneficiaries Served"
          value={data?.total_beneficiaries_served ?? 0}
          bg="bg-green-50"
          iconColor="text-green-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Photo Proof Rate"
          value={`${data?.photo_proof_completion_rate ?? 0}%`}
          bg="bg-teal-50"
          iconColor="text-teal-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={itemsByCategory.length}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      </div>

      {/* Donor Leaderboard + Items by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SectionCard
          title="Donor Leaderboard"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        >
          {donorLeaderboard.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No donors yet.</p>
          ) : (
            <div className="space-y-3">
              {donorLeaderboard.map((donor, i) => (
                <div key={donor.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RankBadge index={i} />
                    <span className="text-sm font-medium text-gray-800">{donor.full_name}</span>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">{donor.donations_count} items</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Items by Category"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        >
          {itemsByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {itemsByCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{cat.category}</span>
                  <span className="text-sm font-semibold bg-purple-100 text-purple-700 px-3 py-0.5 rounded-full">{cat.count} items</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Monthly Donations Chart */}
      <SectionCard
        title="Monthly Donations"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        {monthlyDonations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {monthlyDonations.map((row) => (
              <div key={row.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{row.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-400 h-3 rounded-full" style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-20 text-right">{row.count} donations</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
