import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import { getErrorMessage } from "../utils/errorHandler";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeOrganization = (response) => {
  if (!response) return null;
  if (response.Result && typeof response.Result === "object") return response.Result;
  if (response.result && typeof response.result === "object") return response.result;
  if (response.id || response.name) return response;
  return null;
};

const formatOrgType = (value) => {
  if (!value) return "—";
  return String(value).replace(/_/g, " ");
};

const InfoRow = ({ icon, label, value, isLast = false, iconClassName = "text-gray-400" }) => (
  <div className={`flex items-start gap-3 py-4 ${isLast ? "" : "border-b border-gray-100"}`}>
    <span className={`${iconClassName} mt-0.5`}>{icon}</span>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-900 font-medium break-words">{value || "—"}</p>
    </div>
  </div>
);

export default function MyOrganization() {
  const navigate = useNavigate();
  const location = useLocation();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isNGOView = location.pathname.startsWith("/ngo/");
  const isRecyclerView = location.pathname.startsWith("/recycler/");

  const accent = isNGOView
    ? {
        button: "border-purple-300 text-purple-700 hover:bg-purple-50 focus:ring-purple-200",
        iconWrap: "bg-purple-100 text-purple-600",
        sectionTitle: "text-purple-900",
        rowIcon: "text-purple-500",
      }
    : isRecyclerView
    ? {
        button: "border-teal-300 text-teal-700 hover:bg-teal-50 focus:ring-teal-200",
        iconWrap: "bg-teal-100 text-teal-600",
        sectionTitle: "text-teal-900",
        rowIcon: "text-teal-500",
      }
    : {
        button: "border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-200",
        iconWrap: "bg-blue-100 text-blue-600",
        sectionTitle: "text-blue-900",
        rowIcon: "text-blue-500",
      };

  useEffect(() => {
    let mounted = true;

    const loadOrganization = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getMyOrganization();
        if (!mounted) return;

        const normalized = normalizeOrganization(response);
        setOrganization(normalized);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, "Failed to load organization details"));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrganization();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-gray-600">Loading organization details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800">No organization details found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Organization</h1>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 ${accent.button}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 16.5H9v-3.5z" />
          </svg>
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${accent.iconWrap}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-gray-900 break-words">{organization.name || "Organization"}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
                  organization.is_verified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {organization.is_verified ? "Verified" : "Pending Verification"}
              </span>
              <span className="text-gray-500">Member since {formatDate(organization.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h3 className={`text-2xl font-semibold mb-2 ${accent.sectionTitle}`}>Contact & Location</h3>
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2z" /></svg>}
          label="Email Address"
          value={organization.user_email}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM19 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          label="Contact Person"
          value={organization.user_name}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Full Address"
          value={organization.address}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          label="Established Date"
          value={formatDate(organization.established_date)}
          isLast
          iconClassName={accent.rowIcon}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <h3 className={`text-2xl font-semibold mb-2 ${accent.sectionTitle}`}>Organization Details</h3>
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Registration Number"
          value={organization.registration_number}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14" /></svg>}
          label="Organization Type"
          value={formatOrgType(organization.org_type)}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2m-6-8l6-6m0 0v4m0-4h-4" /></svg>}
          label="Application ID"
          value={organization.role_application_id}
          iconClassName={accent.rowIcon}
        />
        <InfoRow
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Last Updated"
          value={formatDateTime(organization.updated_at)}
          isLast
          iconClassName={accent.rowIcon}
        />

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-gray-900 whitespace-pre-wrap">{organization.description || "—"}</p>
        </div>
      </div>
    </div>
  );
}
