import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../auth/AuthProvider";
import logo from "../../logo.png";

export default function NavBar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and brand */}
        <NavLink to="/products" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-green-600 transition">
          <img src={logo} alt="EcoLoop" className="w-8 h-8" />
          <span className="hidden sm:inline">EcoLoop</span>
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-8 items-center text-sm">
          {isAuthenticated && (
            <>
              <NavLink to="/impact" className={({isActive}) => `flex items-center gap-2 transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden lg:inline">Impact</span>
              </NavLink>
              <NavLink to="/products" className={({isActive}) => `flex items-center gap-2 transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden lg:inline">Browse</span>
              </NavLink>
              <NavLink to="/favorites" className={({isActive}) => `flex items-center gap-2 transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden lg:inline">Favorites</span>
              </NavLink>
              <NavLink to="/my-transactions" className={({isActive}) => `flex items-center gap-2 transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden lg:inline">My Transactions</span>
              </NavLink>
              <NavLink to="/messages" className={({isActive}) => `flex items-center gap-2 transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Messages</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Profile</span>
                </NavLink>
                <button
                  onClick={logout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-gray-700 hover:text-green-600`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-gray-700 hover:text-green-600 font-medium"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 flex flex-col gap-2 text-sm">
            {isAuthenticated ? (
              <>
                <NavLink to="/impact" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Impact</span>
                </NavLink>
                <NavLink to="/products" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Browse</span>
                </NavLink>
                <NavLink to="/favorites" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Favorites</span>
                </NavLink>
                <NavLink to="/my-transactions" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>My Transactions</span>
                </NavLink>
                <NavLink to="/messages" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Messages</span>
                </NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </NavLink>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="flex items-center gap-3 py-2 px-3 text-gray-700 hover:text-green-600 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-2 px-4 text-gray-700 hover:text-green-600 font-medium rounded-lg transition">
                  Log In
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg transition">
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
