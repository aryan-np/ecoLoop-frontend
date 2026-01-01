import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="ecoLoop" className="w-32 h-32" />
        </div>

        {/* Welcome text */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Eco Loop</h1>
        <p className="text-gray-600 text-sm mb-8">Reuse, Recycle, Donate — all in one platform</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Browse as Guest
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex justify-center gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-700">About</a>
          <a href="#" className="hover:text-gray-700">Privacy Policy</a>
          <a href="#" className="hover:text-gray-700">Help</a>
        </div>
      </div>
    </div>
  );
}
