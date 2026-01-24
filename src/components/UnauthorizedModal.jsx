import React from "react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleSignup = () => {
    onClose();
    navigate("/register");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Authentication Required</h3>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-6">
          You must be logged in to perform this action.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Log In
          </button>
          <button
            onClick={handleSignup}
            className="w-full py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 font-medium hover:text-gray-900 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
