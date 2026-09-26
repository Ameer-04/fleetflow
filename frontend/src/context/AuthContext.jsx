import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/auth.service";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = error.config?.url || "";
        const isCredentialRequest = /\/auth\/(login|register)$/.test(requestUrl);

        if (error.response?.status === 401 && !isCredentialRequest) {
          setUser(null);
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  const login = async (credentials) => {
    const currentUser = await loginRequest(credentials);
    setUser(currentUser);

    return currentUser;
  };

  const register = async (userData) => {
    const currentUser = await registerRequest(userData);
    setUser(currentUser);

    return currentUser;
  };

  const logout = async () => {
    setLoggingOut(true);

    try {
      await logoutRequest();
    } catch {
      // The local session must still end if the server cannot be reached.
    } finally {
      setUser(null);
      setLoggingOut(false);
    }
  };

  const value = {
    user,
    loading,
    loggingOut,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// This hook is intentionally co-located with its provider and context.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};