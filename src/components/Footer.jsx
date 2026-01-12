import React from "react";
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
              <li><a href="/" className="hover:text-green-400 transition">Home</a></li>
              <li><a href="/products" className="hover:text-green-400 transition">Browse Products</a></li>
              <li><a href="/products/new" className="hover:text-green-400 transition">Sell Item</a></li>
              <li><a href="/dashboard" className="hover:text-green-400 transition">Dashboard</a></li>
            </ul>
          </div>

          {/* About section */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-green-400 transition">FAQs</a></li>
            </ul>
          </div>

          {/* Legal section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-green-400 transition">
              <span className="text-sm">Facebook</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition">
              <span className="text-sm">Twitter</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition">
              <span className="text-sm">Instagram</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition">
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
            <p>&copy; {currentYear} ecoLoop. All rights reserved.</p>
            <p className="mt-2">Making sustainability circular, one item at a time.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
