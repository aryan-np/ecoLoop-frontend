import React, { useState } from "react";
import DialogModal from "./DialogModal";
import authAPI from "../api/auth";
import Toast from "./Toast";

export default function VerificationApplicationModal({ isOpen, onClose, applicationType, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Choose type, 2: Fill form, 3: Confirm
  const [selectedType, setSelectedType] = useState(applicationType || null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Organization Information
    organization_name: "",
    registration_number: "",
    years_in_operation: "",
    contact_person_name: "",
    contact_phone: "",
    contact_email: "",
    
    // Location & Service Area
    office_address: "",
    service_coverage_area: "",
    
    // Documentation
    business_certificate: null,
    
    // Confirmation
    terms_accepted: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, business_certificate: file });
    }
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleBackToTypeSelection = () => {
    setStep(1);
    setSelectedType(null);
  };

  const handleProceedToConfirm = () => {
    // Validate form
    if (!formData.organization_name || !formData.registration_number || 
        !formData.contact_person_name || !formData.contact_phone || 
        !formData.contact_email || !formData.office_address || 
        !formData.service_coverage_area) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    setStep(3);
  };

  const handleBackToForm = () => {
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.terms_accepted) {
      setToast({ message: "Please accept the terms and conditions", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        organization_name: formData.organization_name,
        registration_number: formData.registration_number,
        years_in_operation: formData.years_in_operation || 0,
        contact_person_name: formData.contact_person_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        office_address: formData.office_address,
        service_coverage_area: formData.service_coverage_area,
      };

      if (formData.business_certificate) {
        submitData.business_certificate = formData.business_certificate;
      }

      let response;
      if (selectedType === "recycler") {
        response = await authAPI.submitRecyclerApplication(submitData);
      } else {
        response = await authAPI.submitNGOApplication(submitData);
      }

      if (response.IsSuccess || response.id) {
        setToast({ message: "Application submitted successfully!", type: "success" });
        setTimeout(() => {
          onSuccess && onSuccess();
          handleClose();
        }, 1500);
      } else {
        setToast({
          message: response.ErrorMessage || "Failed to submit application",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: error.message || "An error occurred while submitting the application",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setFormData({
      organization_name: "",
      registration_number: "",
      years_in_operation: "",
      contact_person_name: "",
      contact_phone: "",
      contact_email: "",
      office_address: "",
      service_coverage_area: "",
      business_certificate: null,
      terms_accepted: false,
    });
    onClose();
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <DialogModal isOpen={isOpen} onClose={handleClose} title={
        step === 1 ? "Apply for Verified Role" : 
        step === 2 ? `${selectedType === "recycler" ? "Recycler" : "NGO"} Verification Application` :
        "Confirm Application"
      }>
        {step === 1 && (
          <div className="py-4">
            <p className="text-gray-600 mb-6">Upgrade your account to become a verified Recycler or NGO</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recycler Card */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M15.05,16L11.97,14.15L8.9,16L9.71,12.5L7.13,10.16L10.76,9.85L11.97,6.5L13.18,9.84L16.81,10.15L14.23,12.5L15.05,16Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Become a Recycler</h3>
                <p className="text-gray-600 text-sm mb-4">Collect and process recyclable waste from users</p>
                <button
                  onClick={() => handleSelectType("recycler")}
                  className="w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Apply as Recycler
                </button>
              </div>

              {/* NGO Card */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Become an NGO</h3>
                <p className="text-gray-600 text-sm mb-4">Receive donations and support communities</p>
                <button
                  onClick={() => handleSelectType("ngo")}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Apply as NGO
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-4 max-h-[500px] overflow-y-auto">
            {/* Back Button */}
            <button
              onClick={handleBackToTypeSelection}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back to Profile
            </button>

            <p className="text-gray-600 text-sm mb-6">
              Apply to become a verified {selectedType === "recycler" ? "recycler" : "NGO"} on Eco Loop platform
            </p>

            {/* Organization Information Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3M18.82 9L12 12.72L5.18 9L12 5.28L18.82 9M17 16L12 18.72L7 16V12.27L12 15L17 12.27V16Z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization / Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 12345-067"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years in Operation
                    </label>
                    <input
                      type="number"
                      name="years_in_operation"
                      value={formData.years_in_operation}
                      onChange={handleInputChange}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    placeholder="Rajesh Kumar"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="+977-9841234567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Official Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="sdf@kjwlan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Service Area Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Location & Service Area</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="office_address"
                    value={formData.office_address}
                    onChange={handleInputChange}
                    placeholder="Enter full office address"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Coverage Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="service_coverage_area"
                    value={formData.service_coverage_area}
                    onChange={handleInputChange}
                    placeholder="e.g., Kathmandu Valley, Lalitpur, Bhaktapur"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Google Map Pin integration will be available in the full version
                  </p>
                </div>
              </div>
            </div>

            {/* Documentation Upload Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Documentation Upload</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Certificate
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {formData.business_certificate && (
                    <p className="text-xs text-green-600 mt-2">
                      File selected: {formData.business_certificate.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBackToTypeSelection}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToConfirm}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-4">
            {/* Back Button */}
            <button
              onClick={handleBackToForm}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Please review your application details before submission. Our team will review your application and get back to you within 2-3 business days.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Application Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium text-gray-900">{formData.organization_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration #:</span>
                  <span className="font-medium text-gray-900">{formData.registration_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Person:</span>
                  <span className="font-medium text-gray-900">{formData.contact_person_name}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm that all information provided is accurate and true. By submitting this application, 
                  you agree to Eco Loop's terms and conditions for verified {selectedType === "recycler" ? "recyclers" : "NGOs"}.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBackToForm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.terms_accepted}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
          </div>
        )}
      </DialogModal>
    </>
  );
}
