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
    setLoading(false); // ← signalizuje, že sa token načítal
  }, []);

  const loginUser = (token: string) => {
    const decoded: User = jwtDecode(token);
    setToken(token);
    setUser(decoded);
    localStorage.setItem("access_token", token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
