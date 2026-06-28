import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('interviewpilot_token');
    const profile = localStorage.getItem('interviewpilot_user');
    if (token && profile) {
      setUser(JSON.parse(profile));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('interviewpilot_token', token);
    localStorage.setItem('interviewpilot_user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (payload) => {
    const response = await axiosClient.post('/auth/register', payload);
    const { token, user } = response.data;
    localStorage.setItem('interviewpilot_token', token);
    localStorage.setItem('interviewpilot_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('interviewpilot_token');
    localStorage.removeItem('interviewpilot_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
