// AuthContext — manages login state via localStorage session
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, getSession } from "../db/localDB";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = loginUser(email, password);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
