import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  surName: string;
  email: string;
  role: string;
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

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      loginUser(storedToken);
    }
  }, []);

  const loginUser = (token: string) => {
    const decoded: User = jwtDecode(token);
    setToken(token);
    setUser(decoded);
    localStorage.setItem("access_token", token);
    //console.log(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
