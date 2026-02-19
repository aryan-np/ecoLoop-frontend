import React, { useState } from "react";
import authAPI from "../api/auth";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { getErrorMessage } from "../utils/errorHandler";
import logo from "../../logo.png";

export default function Register() {
  const [form, setForm] = useState({ email: "", full_name: "", phone_number: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email) return "Email required";
    if (!form.full_name) return "Full name required";
    if (!form.phone_number || !/^[0-9]{10}$/.test(form.phone_number)) return "Phone must be 10 digits";
    if (!form.password || form.password.length < 8) return "Password must be at least 8 chars";
    if (form.password !== form.confirm_password) return "Passwords do not match";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setToast({ type: "error", message: err, key: Date.now() });
      return;
    }

    setLoading(true);
    try {
      const resp = await authAPI.register(form.email, form.full_name, form.phone_number, form.password, form.confirm_password);
      if (resp.IsSuccess) {
        console.log("Registration Response:", resp);
        const regId = resp.Result?.user?.registration_id || resp.Result?.registration_id || resp.Result?.id;
        console.log("Registration ID to send:", regId);
        setToast({ type: "success", message: "Registration successful! OTP sent to email.", key: Date.now() });
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: form.email, purpose: "REGISTER", registration_id: regId } });
        }, 2000);
      } else {
        setToast({ type: "error", message: getErrorMessage(resp, "Registration failed"), key: Date.now() });
      }
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "An error occurred during registration"), key: Date.now() });
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
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 text-sm mt-2">Join ecoLoop community</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="user@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={onChange}
              placeholder="+977-1234567890"
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
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={onChange}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" id="terms" className="w-4 h-4 rounded border-gray-300" />
            <label htmlFor="terms" className="text-gray-600">
              I accept the <a href="#" className="text-green-600 font-semibold hover:underline">Terms and Conditions</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-green-600 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-green-600 mt-4 font-semibold"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
