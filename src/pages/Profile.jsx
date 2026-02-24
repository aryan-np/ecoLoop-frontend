import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthProvider";
import authAPI from "../api/auth";
import apiClient from "../api/client";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Try multiple endpoints for flexibility
      let resp = await authAPI.getUserProfile();
      
      let profileData = null;
      // Handle paginated response format
      if (resp.results && Array.isArray(resp.results)) {
        profileData = resp.results.length > 0 ? resp.results[0] : null;
      } else if (resp.IsSuccess) {
        if (Array.isArray(resp.Result)) {
          profileData = resp.Result.length > 0 ? resp.Result[0] : null;
        } else if (resp.Result && typeof resp.Result === 'object') {
          profileData = resp.Result;
        }
      } else if (Array.isArray(resp)) {
        profileData = resp.length > 0 ? resp[0] : null;
      } else if (resp && typeof resp === 'object' && resp.id) {
        profileData = resp;
      }

      if (profileData && profileData.id) {
        setProfile(profileData);
        setFormData(profileData);
      } else {
        // Create default profile with user data
        const defaultProfile = {
          id: null,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          profile_picture: null,
          city: "",
          area: "",
          postal_code: "",
          latitude: "",
          longitude: "",
          bio: "",
          created_at: "",
          updated_at: "",
        };
        setProfile(defaultProfile);
        setFormData(defaultProfile);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      const defaultProfile = {
        id: null,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        profile_picture: null,
        city: "",
        area: "",
        postal_code: "",
        latitude: "",
        longitude: "",
        bio: "",
        created_at: "",
        updated_at: "",
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store both the File object for upload and a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profile_picture: file, profile_picture_preview: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure we have a valid profile ID
      if (!profile?.id) {
        setToast({ message: "Error: Profile ID not found", type: "error" });
        setIsSaving(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name || "");
      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("area", formData.area || "");
      formDataToSend.append("postal_code", formData.postal_code || "");
      formDataToSend.append("bio", formData.bio || "");

      // Handle profile picture - append only if it's a File object
      if (formData.profile_picture instanceof File) {
        formDataToSend.append("profile_picture", formData.profile_picture);
      }

      // Always use PATCH to update user profile with id from profile
      const resp = await apiClient(`/api/auth/user-profile/${profile.id}/`, {
        method: "PATCH",
        body: formDataToSend,
      });

      if (resp.IsSuccess || resp.id) {
        const updatedProfile = resp.Result || resp;
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        setToast({ message: "Profile updated successfully!", type: "success" });
        // Refresh profile data from server
        await loadProfile();
      } else {
        setToast({
          message: getErrorMessage(resp, "Failed to update profile"),
          type: "error",
          key: Date.now()
        });
      }
    } catch (err) {
      setToast({ message: getErrorMessage(err, "Failed to update profile"), type: "error", key: Date.now() });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user already has Recycler or NGO role
  const hasRecyclerRole = profile?.roles?.some(role => role.name === "RECYCLER");
  const hasNGORole = profile?.roles?.some(role => role.name === "NGO");
  
  // Use API flags for application status
  const canApplyRecycler = profile?.can_apply_recycler ?? false;
  const canApplyNGO = profile?.can_apply_ngo ?? false;
  const hasAppliedRecycler = profile?.has_applied_recycler ?? false;
  const hasAppliedNGO = profile?.has_applied_ngo ?? false;
  
  // Show application section if user doesn't have roles AND hasn't been rejected (can still apply)
  const showApplicationSection = !hasRecyclerRole && !hasNGORole && (canApplyRecycler || canApplyNGO || hasAppliedRecycler || hasAppliedNGO);

  const handleApplyClick = (type) => {
    const hasApplied = type === "recycler" ? hasAppliedRecycler : hasAppliedNGO;
    
    if (hasApplied) {
      // If already applied, go to application status page
      navigate("/application-status");
    } else {
      // Otherwise, go to application form
      navigate(`/verification-application/${type}`);
    }
  };

  const handleDiscard = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-gray-600">Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {!isEditing ? (
        // View Mode
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              {profile.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">
                    {profile.full_name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                {profile.created_at && (
                  <div className="inline-block px-3 py-1 bg-green-100 bg-opacity-60 text-green-700 text-xs font-semibold rounded-full">
                    Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setFormData(profile);
                }}
                className="text-green-600 font-semibold hover:text-green-700 text-sm"
              >
                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                  <p className="text-gray-900 font-medium">{profile.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                  <p className="text-gray-900 font-medium">{profile.phone_number || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                  <p className="text-gray-900 font-medium">
                    {profile.address_line1 ? `${profile.address_line1}${profile.address_line2 ? `, ${profile.address_line2}` : ""}` : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">City</p>
                  <p className="text-gray-900 font-medium">{profile.city || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Area</p>
                  <p className="text-gray-900 font-medium">{profile.area || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Email</p>
                <p className="text-gray-900 font-medium">{profile.email} <span className="text-xs text-gray-500">(Read-only)</span></p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Role{profile.roles && profile.roles.length > 1 ? 's' : ''}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.roles && profile.roles.length > 0 ? (
                    profile.roles.map((role) => {
                      const roleColors = {
                        USER: 'bg-blue-100 text-blue-700',
                        ADMIN: 'bg-purple-100 text-purple-700',
                        NGO: 'bg-green-100 text-green-700',
                        RECYCLER: 'bg-teal-100 text-teal-700',
                      };
                      const colorClass = roleColors[role.name] || 'bg-gray-100 text-gray-700';
                      return (
                        <span key={role.id} className={`inline-block px-3 py-1 text-sm font-semibold rounded-lg ${colorClass}`}>
                          {role.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                      USER
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Verification Status</h2>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                profile.is_email_verified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <span className="text-gray-900 font-medium">Email Verification</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  profile.is_email_verified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {profile.is_email_verified ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Verified
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      Not Verified
                    </>
                  )}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                profile.is_phone_verified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <span className="text-gray-900 font-medium">Phone Verification</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  profile.is_phone_verified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {profile.is_phone_verified ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Verified
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      Not Verified
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Apply for Verified Role */}
          {showApplicationSection && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Apply for Verified Role</h2>
              <p className="text-gray-600 text-sm mb-6">Upgrade your account to become a verified Recycler or NGO</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recycler Card */}
                {(canApplyRecycler || hasAppliedRecycler) && (
                  <div className="border border-gray-200 rounded-lg p-6 hover:border-green-400 hover:shadow-md transition">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M15.05,16L11.97,14.15L8.9,16L9.71,12.5L7.13,10.16L10.76,9.85L11.97,6.5L13.18,9.84L16.81,10.15L14.23,12.5L15.05,16Z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Become a Recycler</h3>
                    <p className="text-gray-600 text-sm mb-4">Collect and process recyclable waste from users</p>
                    {hasAppliedRecycler && (
                      <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs text-orange-700 font-semibold">Application Pending Review</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleApplyClick("recycler")}
                      disabled={!canApplyRecycler && !hasAppliedRecycler}
                      className={`w-full px-4 py-2.5 font-semibold rounded-lg transition ${
                        hasAppliedRecycler
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : canApplyRecycler
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {hasAppliedRecycler ? "View Application Status" : "Apply as Recycler"}
                    </button>
                  </div>
                )}

                {/* NGO Card */}
                {(canApplyNGO || hasAppliedNGO) && (
                  <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-md transition">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Become an NGO</h3>
                    <p className="text-gray-600 text-sm mb-4">Receive donations and support communities</p>
                    {hasAppliedNGO && (
                      <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs text-orange-700 font-semibold">Application Pending Review</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleApplyClick("ngo")}
                      disabled={!canApplyNGO && !hasAppliedNGO}
                      className={`w-full px-4 py-2.5 font-semibold rounded-lg transition ${
                        hasAppliedNGO
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : canApplyNGO
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {hasAppliedNGO ? "View Application Status" : "Apply as NGO"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate("/my-reports")}
                className="w-full text-left px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
                My Reports
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

          <form className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {/* Full Name (Editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Phone Number (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number || ""}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex items-center gap-4">
                {formData.profile_picture_preview ? (
                  <img 
                    src={formData.profile_picture_preview} 
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : formData.profile_picture && typeof formData.profile_picture === 'string' ? (
                  <img 
                    src={formData.profile_picture} 
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-xl">No Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* City & Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Kathmandu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Thamel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ""}
                onChange={handleInputChange}
                placeholder="e.g., 44600"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
