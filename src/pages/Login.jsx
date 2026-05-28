import React, { useState, useContext } from "react";
import authAPI from "../api/auth";
import AuthContext from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";
import logo from "../../logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitPassword = async (e) => {
    e.preventDefault();

    if (!form.email) return setToast({ type: "error", message: "Email is required", key: Date.now() });
    if (!form.password) return setToast({ type: "error", message: "Password is required", key: Date.now() });

    setPasswordLoading(true);
    try {
      const resp = await authAPI.loginWithPassword(form.email, form.password);
      if (resp.IsSuccess) {
        if (resp.Result?.tokens) {
          login({ ...resp.Result.tokens, user: resp.Result.user });

          const userRoles = resp.Result.user?.roles || [];
          const isAdmin = userRoles.some(role => role.name === 'ADMIN');
          const isNGO = userRoles.some(role => role.name === 'NGO');
          const isRecycler = userRoles.some(role => role.name === 'RECYCLER');

          if (isAdmin) {
            navigate("/admin/dashboard", { state: { loginSuccess: true } });
          } else if (isNGO) {
            navigate("/ngo/dashboard", { state: { loginSuccess: true } });
          } else if (isRecycler) {
            navigate("/recycler/dashboard", { state: { loginSuccess: true } });
          } else {
            navigate("/impact", { state: { loginSuccess: true } });
          }
        }
      } else {
        setToast({ type: "error", message: getErrorMessage(resp, "Login failed"), key: Date.now() });
      }
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "An error occurred during login"), key: Date.now() });
    } finally {
      setPasswordLoading(false);
    }
  };

  const submitOTP = async (e) => {
    e.preventDefault();

    if (!form.email) return setToast({ type: "error", message: "Email is required", key: Date.now() });

    setOtpLoading(true);
    try {
      const resp = await authAPI.login(form.email, "OTP");
      if (resp.IsSuccess) {
        setToast({ type: "info", message: "OTP sent! Check your email...", key: Date.now() });
        setTimeout(() => navigate("/verify-otp", { state: { email: form.email, purpose: "LOGIN" } }), 1500);
      } else {
        setToast({ type: "error", message: getErrorMessage(resp, "Failed to send OTP"), key: Date.now() });
      }
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "An error occurred"), key: Date.now() });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="ecoLoop" className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Log In</h2>
          <p className="text-gray-600 text-sm mt-2">Enter your credentials to access your account</p>
        </div>

        {/* Password Login Form */}
        <form onSubmit={submitPassword} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Enter email or phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {passwordLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* OTP Login Button */}
        <button
          onClick={submitOTP}
          disabled={otpLoading}
          className="w-full py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition"
        >
          {otpLoading ? "Sending OTP..." : "Log in with OTP"}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-green-600 font-semibold hover:underline"
            >
              Create account
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-gray-600 hover:text-green-600 mt-3 font-semibold"
          >
            ← Browse Products
          </button>
        </div>
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
