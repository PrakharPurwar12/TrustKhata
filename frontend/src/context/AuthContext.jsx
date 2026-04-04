import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const storageKey = 'trustkhata-user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = window.localStorage.getItem(storageKey);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [user]);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
