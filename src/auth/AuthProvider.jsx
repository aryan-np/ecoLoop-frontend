import React, { createContext, useState, useEffect } from "react";
import authAPI from "../api/auth";
import tokenService from "./tokenService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => tokenService.getTokens());
  const [currentUser, setCurrentUser] = useState(() => tokenService.getUser());
  const navigate = useNavigate();

  useEffect(() => {
    // subscribe to token changes from tokenService
    tokenService.onTokenChange((t) => {
      setTokens(t);
      setCurrentUser(t.user || null);
    });
  }, []);

  const login = ({ access, refresh, user }) => {
    tokenService.setTokens({ access, refresh });
    if (user) tokenService.setUser(user);
    setTokens({ access, refresh, user: user || tokenService.getUser() });
    setCurrentUser(user || tokenService.getUser());
  };

  const logout = async () => {
    // try to call logout endpoint if we have refresh
    const refresh = tokenService.getRefresh();
    if (refresh) {
      try {
        await authAPI.logout(refresh);
      } catch (e) {
        // ignore errors
      }
    }

    tokenService.clearTokens();
    setTokens({ access: null, refresh: null });
    navigate("/");
  };

  const refreshAccess = async () => {
    const newAccess = await tokenService.refreshAccess();
    if (newAccess) setTokens((t) => ({ ...t, access: newAccess }));
    else {
      tokenService.clearTokens();
      setTokens({ access: null, refresh: null });
    }
    return newAccess;
  };

  const value = {
    access: tokens.access,
    refresh: tokens.refresh,
    user: currentUser,
    login,
    logout,
    refreshAccess,
    isAuthenticated: !!tokens.access,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
