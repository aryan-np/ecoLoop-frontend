import React, { useState, useEffect, useContext } from "react";
import apiClient from "../api/client";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthProvider";
import Alert from "../components/Alert";
import OTPInput from "../components/OTPInput";
import logo from "../../logo.png";

export default function VerifyOTP() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState(loc.state?.email || "");
  const [purpose, setPurpose] = useState(loc.state?.purpose || "REGISTER");
  const [registrationId, setRegistrationId] = useState(loc.state?.registration_id || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (otp.length !== 6) return setMessage({ type: "error", text: "OTP must be 6 digits" });

    setLoading(true);
    try {
      const body = { email, purpose, otp };
      // Always include registration_id for REGISTER purpose
      if (purpose === "REGISTER") {
        if (registrationId) {
          body.registration_id = registrationId;
        } else if (loc.state?.registration_id) {
          body.registration_id = loc.state.registration_id;
        }
      }
      console.log("OTP Request Body:", body); // Debug log
      const resp = await apiClient("/api/auth/otp/verify/", { method: "POST", body });
      if (resp.IsSuccess) {
        if (resp.Result && resp.Result.tokens) {
          login({ ...resp.Result.tokens, user: resp.Result.user });
          navigate("/dashboard", { replace: true });
        } else {
          setMessage({ type: "success", text: resp.Result?.message || "OTP verified successfully" });
          // For registration, redirect to login
          if (purpose === "REGISTER") {
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      } else {
        setMessage({ type: "error", text: Array.isArray(resp.ErrorMessage) ? resp.ErrorMessage.join("; ") : JSON.stringify(resp.ErrorMessage) });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || JSON.stringify(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="ecoLoop" className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Log in with OTP</h2>
          <p className="text-gray-600 text-sm mt-2">Enter the 6-digit code sent to your email</p>
        </div>

        {message && <Alert type={message.type === "error" ? "error" : "success"} className="mb-6">{message.text}</Alert>}

        <form onSubmit={submit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Enter 6-Digit OTP</label>
            <OTPInput
              value={otp}
              onChange={setOtp}
            />
            <p className="text-xs text-gray-500 mt-3">Code sent to {email}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => navigate(purpose === "LOGIN" ? "/login" : "/register")}
            className="text-gray-600 hover:text-green-600 font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
