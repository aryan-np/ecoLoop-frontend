import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import Toast from "../components/Toast";

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getMyApplications();
      
      let applicationData = null;
      if (response.IsSuccess && response.Result && response.Result.length > 0) {
        // Get the most recent application
        applicationData = response.Result[0];
      } else if (Array.isArray(response) && response.length > 0) {
        applicationData = response[0];
      }

      setApplication(applicationData);
    } catch (error) {
      console.error("Error loading application:", error);
      setToast({ message: "Failed to load application status", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = () => {
    const applicationType = application?.role_type === "RECYCLER" ? "recycler" : "ngo";
    navigate(`/verification-application/${applicationType}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading application status...</div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No application found</p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      textColor: "text-orange-700",
      icon: "⏳",
      title: "Status: Pending Review",
      message: "Your application is currently under review by the admin team. This process typically takes 3-5 business days.",
    },
    approved: {
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-700",
      icon: "✓",
      title: "Status: Approved",
      message: "Congratulations! Your application has been approved. Please check your email for further details.",
    },
    rejected: {
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-700",
      icon: "✗",
      title: "Status: Rejected",
      message: "Unfortunately, your application was not approved. Please review the admin notes below and reapply with the necessary corrections.",
    },
  };

  const status = application.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const displayType = application.role_type === "RECYCLER" ? "Recycler" : "NGO";

  return (
    <div className="max-w-4xl mx-auto py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Profile
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Status</h1>
      </div>

      {/* Application Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{displayType === "Recycler" ? "♻️" : "❤️"}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{application.organization_name}</h2>
            <p className="text-sm text-blue-600">Application Type: {displayType}</p>
            <p className="text-xs text-gray-500">
              Submitted: {new Date(application.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-6 mb-6`}>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${config.textColor} mb-2`}>{config.title}</h3>
            <p className={`text-sm ${config.textColor}`}>{config.message}</p>
          </div>
        </div>

        {status === "pending" && (
          <div className="mt-4">
            <p className={`text-sm font-semibold ${config.textColor} mb-2`}>What happens next?</p>
            <ul className={`text-sm ${config.textColor} space-y-1 ml-4`}>
              <li>• Admin will verify your documents</li>
              <li>• Contact information will be validated</li>
              <li>• You'll receive an email notification once reviewed</li>
            </ul>
          </div>
        )}

        {status === "approved" && (
          <div className="mt-4">
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            >
              Go to Profile
            </button>
          </div>
        )}

        {status === "rejected" && (
          <div className="mt-4">
            <button
              onClick={handleReapply}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            >
              Reapply
            </button>
          </div>
        )}
      </div>

      {/* Admin Notes (if rejected) */}
      {status === "rejected" && application.admin_notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
          <p className="text-gray-700">{application.admin_notes}</p>
        </div>
      )}

      {/* Application Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Registration No:</p>
            <p className="text-gray-900">{application.registration_number}</p>
          </div>

          {application.established_date && (
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Established Date:</p>
              <p className="text-gray-900">{new Date(application.established_date).toLocaleDateString()}</p>
            </div>
          )}
          
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-500 mb-1">Address:</p>
            <p className="text-gray-900">{application.address}</p>
          </div>
          
          {application.description && (
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-500 mb-1">Description:</p>
              <p className="text-gray-900">{application.description}</p>
            </div>
          )}
        </div>

        {/* Focus Areas (if available) */}
        {application.focus_areas && application.focus_areas.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-500 mb-2">Focus Areas:</p>
            <div className="flex flex-wrap gap-2">
              {application.focus_areas.map((area, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
