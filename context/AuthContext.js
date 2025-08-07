import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUser({ role: storedUserRole });
    }
  }, []);

  const login = (role) => {
    setUser({ role });
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, userRole: user?.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
