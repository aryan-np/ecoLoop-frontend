import React from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ecoLoop" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">ecoLoop</span>
            </div>
            <p className="text-sm text-gray-400">
              A sustainable marketplace for buying and selling pre-loved items to reduce waste.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-green-400 transition">Browse Products</Link></li>
              <li><Link to="/products/new" className="hover:text-green-400 transition">Sell Item</Link></li>
              <li><Link to="/favorites" className="hover:text-green-400 transition">Favorites</Link></li>
            </ul>
          </div>

          {/* Community section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/impact" className="hover:text-green-400 transition">Impact</Link></li>
              <li><Link to="/donate" className="hover:text-green-400 transition">Donate</Link></li>
              <li><Link to="/recycle" className="hover:text-green-400 transition">Recycle</Link></li>
              <li><Link to="/messages" className="hover:text-green-400 transition">Messages</Link></li>
            </ul>
          </div>

          {/* Legal section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-green-400 transition">Terms & Conditions</Link></li>
              <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Copyright */}
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {currentYear} ecoLoop. All rights reserved.</p>
            <p className="mt-2">Making sustainability circular, one item at a time.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
