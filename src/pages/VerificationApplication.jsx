import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authAPI from "../api/auth";
import Toast from "../components/Toast";

export default function VerificationApplication() {
  const navigate = useNavigate();
  const { type } = useParams(); // 'recycler' or 'ngo'
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: "",
    registration_number: "",
    established_date: "",
    address: "",
    description: "",
    document_files: [],
    terms_accepted: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, document_files: [...formData.document_files, ...files] });
  };

  const removeFile = (index) => {
    const newFiles = formData.document_files.filter((_, i) => i !== index);
    setFormData({ ...formData, document_files: newFiles });
  };

  const parseErrorMessage = (errorMessage) => {
    if (!errorMessage) return "An error occurred";
    
    // If it's a string, return it
    if (typeof errorMessage === 'string') return errorMessage;
    
    // If it's an object with field errors
    if (typeof errorMessage === 'object') {
      // Check for non_field_errors
      if (errorMessage.non_field_errors && Array.isArray(errorMessage.non_field_errors)) {
        return errorMessage.non_field_errors.join(', ');
      }
      
      // Check for other field errors
      const errors = Object.values(errorMessage).flat();
      if (errors.length > 0) {
        return errors.join(', ');
      }
    }
    
    // If it's an array
    if (Array.isArray(errorMessage)) {
      return errorMessage.join(', ');
    }
    
    return "An error occurred";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.organization_name || !formData.registration_number || 
        !formData.established_date || !formData.address || !formData.description) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    if (formData.document_files.length === 0) {
      setToast({ message: "Please upload at least 1 document (Registration proof is compulsory)", type: "error" });
      return;
    }

    if (!formData.terms_accepted) {
      setToast({ message: "Please accept the terms and conditions", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('role_type', type === "recycler" ? "RECYCLER" : "NGO");
      submitData.append('organization_name', formData.organization_name);
      submitData.append('registration_number', formData.registration_number);
      submitData.append('established_date', formData.established_date);
      submitData.append('address', formData.address);
      submitData.append('description', formData.description);

      // Append multiple files
      formData.document_files.forEach((file, index) => {
        submitData.append('document_files', file);
      });

      const response = await authAPI.submitRoleApplication(submitData);

      if (response.IsSuccess || response.id) {
        setToast({ message: "Application submitted successfully!", type: "success" });
        setTimeout(() => {
          navigate("/application-status");
        }, 1500);
      } else {
        // Handle error response
        const errorMsg = parseErrorMessage(response.ErrorMessage);
        setToast({
          message: errorMsg,
          type: "error",
        });
        
        // If user already has a pending application, redirect to status page after showing error
        if (errorMsg.includes("pending") || errorMsg.includes("already have")) {
          setTimeout(() => {
            navigate("/application-status");
          }, 2500);
        }
      }
    } catch (error) {
      // Handle exception
      const errorMsg = error.response?.ErrorMessage 
        ? parseErrorMessage(error.response.ErrorMessage)
        : (error.message || "An error occurred while submitting the application");
      
      setToast({
        message: errorMsg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayType = type === "recycler" ? "Recycler" : "NGO";

  return (
    <div className="max-w-4xl mx-auto py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Profile
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayType} Verification Application</h1>
        <p className="text-gray-600">Apply to become a verified {displayType.toLowerCase()} on Eco Loop platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organization Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3M18.82 9L12 12.72L5.18 9L12 5.28L18.82 9M17 16L12 18.72L7 16V12.27L12 15L17 12.27V16Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Organization Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === "ngo" ? "NGO Name" : "Organization / Business Name"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder={type === "ngo" ? "Enter NGO name" : "Enter organization name"}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder={type === "ngo" ? "e.g., NGO/12345" : "e.g., REG123456"}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="established_date"
                  value={formData.established_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows="3"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your organization and why you want to join..."
                rows="4"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Documentation Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Documentation Upload</h2>
          </div>

          <p className="text-red-600 text-sm font-semibold mb-4">
            * Registration proof is compulsory. At least 1 document is required for form submission.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Documents (Registration Certificate, Permits, etc.)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
              </svg>
              <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mb-3">PDF, JPG, JPEG or PNG (Max: 5MB each)</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                Choose Files
              </label>
            </div>

            {/* Display uploaded files */}
            {formData.document_files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Files ({formData.document_files.length}):</p>
                {formData.document_files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                      </svg>
                      <span className="text-sm text-gray-900 font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleInputChange}
              required
              className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I confirm that all information provided is accurate and true. By submitting this application, 
              you agree to Eco Loop's terms and conditions for verified {displayType.toLowerCase()}s.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.terms_accepted}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
