import React, { createContext, useState, useEffect } from 'react';
import AxiosInstance from './Axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedTokens = localStorage.getItem('authTokens');
    return storedTokens ? JSON.parse(storedTokens).user : null;
  });

  const [authTokens, setAuthTokens] = useState(() => 
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );

  // Effect to set user from tokens on mount
  useEffect(() => {
    if (authTokens) {
      setUser(authTokens.user); // Set the user from authTokens
    }
  }, [authTokens]);

  // Login function
  const login = async (username, password, navigate) => {
    try {
      const response = await AxiosInstance.post('login/', { username, password });
      setAuthTokens(response.data);  // Store tokens
      setUser(response.data.user);  // Store user data
      localStorage.setItem('authTokens', JSON.stringify(response.data));  // Persist tokens in local storage

      // Set token in Axios headers
      AxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Redirect after successful login
      navigate('/');
    } catch (error) {
      console.log('Login failed:', error);
      throw error;  // Rethrow the error for the login component to handle
    }
  };

  // Logout function
  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    delete AxiosInstance.defaults.headers.common['Authorization'];  // Remove token from Axios headers
  };

  const register = async (username, password, email) => {
    const response = await AxiosInstance.post('register/', {
      username,
      password,
      email,
    });
    setAuthTokens(response.data);
    setUser(response.data.user);
    localStorage.setItem('authTokens', JSON.stringify(response.data));
  };

  const isAuthenticated = !!authTokens;  // Check if there are authTokens

  return (
    <AuthContext.Provider value={{ user, authTokens, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
