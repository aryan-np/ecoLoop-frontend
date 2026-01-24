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
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";

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
  const hideNavBar = ['/register', '/login', '/verify-otp'].includes(location.pathname);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setShowUnauthorized(true);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          {!hideNavBar && <NavBar />}
          <main className={hideNavBar ? "flex-grow min-h-screen" : "flex-grow container mx-auto px-4 py-8 min-h-screen"}>
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/seller/:userId" element={<SellerProfile />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className="flex-grow">
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
          </Routes>
        </main>
      )}

      <Footer />
      
      {/* Unauthorized Modal - Only shows when action requires auth */}
      <UnauthorizedModal 
        isOpen={showUnauthorized} 
        onClose={() => setShowUnauthorized(false)} 
      />
    </div>
  );
}
