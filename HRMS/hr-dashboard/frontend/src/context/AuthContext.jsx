import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";   // ← THIS is the only real change

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const signup = async (data) => {
    const res = await api.post("/api/auth/register", data);
    const { token: newToken, ...userData } = res.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    navigate("/dashboard");
  };

  const login = async (data) => {
    const res = await api.post("/api/auth/login", data);
    const { token: newToken, ...userData } = res.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    navigate("/dashboard");
  };

  const refreshUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
