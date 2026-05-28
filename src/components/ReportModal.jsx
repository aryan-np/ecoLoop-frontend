import React, { useEffect, useState } from "react";
import reportAPI from "../api/report";
import Toast from "./Toast";
import { getErrorMessage } from "../utils/errorHandler";

export default function ReportModal({ isOpen, onClose, listingId, conversationId, targetUserId, category = "product" }) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData({ subject: "", description: "", attachment: null });
      setFileName("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, attachment: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      setToast({ type: "error", message: "Please provide a subject", key: Date.now() });
      return;
    }

    if (!formData.description.trim()) {
      setToast({ type: "error", message: "Please provide a description", key: Date.now() });
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        category: String(category || "product").toLowerCase(),
        subject: formData.subject,
        description: formData.description,
      };

      if (targetUserId) {
        reportData.target_user_id = targetUserId;
      }

      if (reportData.category === "product" && listingId) {
        reportData.listing_id = Number(listingId);
      } else if (reportData.category === "message" && conversationId) {
        reportData.conversation_id = Number(conversationId);
      }

      if (formData.attachment) {
        reportData.attachment = formData.attachment;
      }

      const response = await reportAPI.submitReport(reportData);

      if (response.IsSuccess || response.id) {
        setToast({ type: "success", message: "Report submitted successfully", key: Date.now() });
        setTimeout(() => {
          onClose();
          // Reset form
          setFormData({ subject: "", description: "", attachment: null });
          setFileName("");
        }, 1500);
      } else {
        setToast({ type: "error", message: getErrorMessage(response, "Failed to submit report"), key: Date.now() });
      }
    } catch (error) {
      console.error("Report submission error:", error);
      setToast({ type: "error", message: getErrorMessage(error, "Failed to submit report. Please try again."), key: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">
                {category === "message" ? "Report Conversation" : "Report Listing"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide detailed information about the issue..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>

            {/* Attachment */}
            <div>
              <label
                htmlFor="attachment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Attachment (Optional)
              </label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="attachment"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Choose File
                </label>
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                  accept="image/*,.pdf,.doc,.docx"
                />
                {fileName && (
                  <span className="text-sm text-gray-600 truncate">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accepted: Images, PDF, DOC (Max 10MB)
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
