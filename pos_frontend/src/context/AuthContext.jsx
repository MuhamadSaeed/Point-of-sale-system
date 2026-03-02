"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // init
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Auth parse error", err);
        toast.error("Session expired. Please login again.");
        localStorage.clear();
      }
    }
    // it is just responsiable for is it still getting the data or finshed
    setLoading(false);
  }, []);

  // login
  const login = (tokenValue, userData) => {
    localStorage.setItem("accessToken", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(tokenValue);
    setUser(userData);
  };

  // logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    router.replace("/login");
  };

  // roles
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isCashier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
