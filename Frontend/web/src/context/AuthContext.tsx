import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { UserRole } from "../types/userRoles";

interface User {
  id: string;
  name: string;
  surName: string;
  email: string;
  role: UserRole;
  countries: string[];
  brands: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ← nový stav

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      loginUser(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("access_token");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const loginUser = (token: string) => {
    const decoded: User = jwtDecode(token);
    setToken(token);
    setUser(decoded);
    localStorage.setItem("access_token", token);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
