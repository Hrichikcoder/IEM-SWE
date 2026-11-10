import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken('');
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
