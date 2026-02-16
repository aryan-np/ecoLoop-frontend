import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import { AuthProvider } from "./auth/AuthProvider";
import AuthContext from "./auth/AuthProvider";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import UnauthorizedModal from "./components/UnauthorizedModal";
import { onUnauthorized } from "./api/client";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import MyListings from "./pages/MyListings";
import MyReports from "./pages/MyReports";
import Messages from "./pages/Messages";
import Impact from "./pages/Impact";
import RecycleScrap from "./pages/RecycleScrap";
import ScrapRequestForm from "./pages/ScrapRequestForm";
import DonateItems from "./pages/DonateItems";
import DonationForm from "./pages/DonationForm";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import Verifications from "./pages/admin/Verifications";
import DisputesReports from "./pages/admin/DisputesReports";
import SystemLogs from "./pages/admin/SystemLogs";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

function InnerApp() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const hideNavBar = ['/register', '/login', '/verify-otp'].includes(location.pathname) || location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setShowUnauthorized(true);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Show NavBar for everyone except on auth pages and admin pages */}
      {!hideNavBar && <NavBar />}
      
      {isAuthenticated ? (
        <main className={hideNavBar ? "flex-grow min-h-screen" : "flex-grow container mx-auto px-4 py-8 min-h-screen"}>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/recycle" element={<RecycleScrap />} />
            <Route path="/recycle/submit" element={<ScrapRequestForm />} />
            <Route path="/donate" element={<DonateItems />} />
            <Route path="/donate/form" element={<DonationForm />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/seller/:userId" element={<SellerProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="verifications" element={<Verifications />} />
              <Route path="disputes" element={<DisputesReports />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
      ) : (
        <main className={hideNavBar ? "flex-grow min-h-screen" : "flex-grow container mx-auto px-4 py-8 min-h-screen"}>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/seller/:userId" element={<SellerProfile />} />
            <Route path="/recycle" element={<RecycleScrap />} />
            <Route path="/recycle/submit" element={<ScrapRequestForm />} />
            <Route path="/donate" element={<DonateItems />} />
            <Route path="/donate/form" element={<DonationForm />} />
          </Routes>
        </main>
      )}

      {/* Hide Footer on admin pages */}
      {!location.pathname.startsWith('/admin') && <Footer />}
      
      {/* Unauthorized Modal - Only shows when action requires auth */}
      <UnauthorizedModal 
        isOpen={showUnauthorized} 
        onClose={() => setShowUnauthorized(false)} 
      />
    </div>
  );
}
