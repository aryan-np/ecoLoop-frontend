import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../auth/AuthProvider";
import logo from "../../logo.png";

export default function NavBar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-green-600 transition">
          <img src={logo} alt="ecoLoop" className="w-8 h-8" />
          <span className="hidden sm:inline">ecoLoop</span>
        </NavLink>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-8 items-center text-sm">
          <NavLink to="/dashboard" className={({isActive}) => `transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={({isActive}) => `transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
            Browse
          </NavLink>
          <NavLink to="/messages" className={({isActive}) => `transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600'}`}>
            Messages
          </NavLink>
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <>
                <NavLink
                  to="/profile"
                  className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-purple-600 hover:bg-purple-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">{user?.full_name || user?.email}</span>
                </NavLink>
                <button
                  onClick={logout}
                  className="text-sm px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Logout
                </button>
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
            <NavLink to="/dashboard" onClick={() => setOpen(false)} className={({isActive}) => `py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
              Dashboard
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)} className={({isActive}) => `py-2 px-3 rounded-lg transition ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
              Browse
            </NavLink>
            <NavLink to="/profile" onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-2 py-2 px-3 rounded-lg transition ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-purple-600 hover:bg-purple-50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{user?.full_name || user?.email}</span>
            </NavLink>
            {isAuthenticated && (
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
