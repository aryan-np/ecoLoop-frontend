import React, { useState, useContext } from "react";
import authAPI from "../api/auth";
import AuthContext from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Alert from "../components/Alert";
import Toast from "../components/Toast";
import logo from "../../logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitPassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email) return setMessage({ type: "error", text: "Email is required" });
    if (!form.password) return setMessage({ type: "error", text: "Password is required" });

    setLoading(true);
    try {
      const resp = await authAPI.loginWithPassword(form.email, form.password);
      if (resp.IsSuccess) {
        if (resp.Result?.tokens) {
          login({ ...resp.Result.tokens, user: resp.Result.user });
          
          // Check user roles and redirect accordingly
          const userRoles = resp.Result.user?.roles || [];
          const isAdmin = userRoles.some(role => role.name === 'ADMIN');
          const isNGO = userRoles.some(role => role.name === 'NGO');
          const isRecycler = userRoles.some(role => role.name === 'RECYCLER');
          
          // Redirect based on role priority: Admin > NGO > Recycler > Regular User
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
        // Handle nested error message structure
        let errorMsg = "Login failed";
        if (resp.ErrorMessage?.message && Array.isArray(resp.ErrorMessage.message)) {
          errorMsg = resp.ErrorMessage.message.join("; ");
        } else if (Array.isArray(resp.ErrorMessage)) {
          errorMsg = resp.ErrorMessage.join("; ");
        } else if (typeof resp.ErrorMessage === 'string') {
          errorMsg = resp.ErrorMessage;
        } else if (resp.ErrorMessage) {
          errorMsg = JSON.stringify(resp.ErrorMessage);
        }
        setToast({ type: "error", message: errorMsg });
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email) return setMessage({ type: "error", text: "Email is required" });

    setLoading(true);
    try {
      const resp = await authAPI.login(form.email, "OTP");
      if (resp.IsSuccess) {
        setToast({ type: "info", message: "OTP sent! Check your email..." });
        setTimeout(() => navigate("/verify-otp", { state: { email: form.email, purpose: "LOGIN" } }), 1500);
      } else {
        // Handle nested error message structure
        let errorMsg = "Failed to send OTP";
        if (resp.ErrorMessage?.message && Array.isArray(resp.ErrorMessage.message)) {
          errorMsg = resp.ErrorMessage.message.join("; ");
        } else if (Array.isArray(resp.ErrorMessage)) {
          errorMsg = resp.ErrorMessage.join("; ");
        } else if (typeof resp.ErrorMessage === 'string') {
          errorMsg = resp.ErrorMessage;
        } else if (resp.ErrorMessage) {
          errorMsg = JSON.stringify(resp.ErrorMessage);
        }
        setToast({ type: "error", message: errorMsg });
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "An error occurred" });
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
          <h2 className="text-2xl font-bold text-gray-900">Log In</h2>
          <p className="text-gray-600 text-sm mt-2">Enter your credentials to access your account</p>
        </div>

        {message && <Alert type={message.type === "error" ? "error" : "success"} className="mb-4">{message.text}</Alert>}

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
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Log In"}
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
          disabled={loading}
          className="w-full py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition"
        >
          {loading ? "Sending OTP..." : "Log in with OTP"}
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

      {toast && <Toast type={toast.type} message={toast.message} duration={2000} onClose={() => setToast(null)} />}
    </div>
  );
}
