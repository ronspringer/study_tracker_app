import React, { createContext, useState, useEffect } from 'react';  // Import necessary hooks and createContext from React
import AxiosInstance from './Axios';  // Import the Axios instance for making API requests

// Create a new context for authentication
const AuthContext = createContext();

// AuthProvider component to manage authentication state
const AuthProvider = ({ children }) => {
  // State to hold user information, initialized from local storage if available
  const [user, setUser] = useState(() => {
    const storedTokens = localStorage.getItem('authTokens');  // Retrieve tokens from local storage
    return storedTokens ? JSON.parse(storedTokens).user : null;  // Parse tokens and get user or return null
  });

  // State to hold authentication tokens, also initialized from local storage
  const [authTokens, setAuthTokens] = useState(() => 
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null  // Parse tokens if available
  );

  // Effect to set user from tokens when the component mounts or when authTokens change
  useEffect(() => {
    if (authTokens) {
      setUser(authTokens.user); // Set the user from authTokens when they are available
    }
  }, [authTokens]);  // Dependency array includes authTokens

  // Login function to authenticate the user
  const login = async (username, password, navigate) => {
    try {
      const response = await AxiosInstance.post('login/', { username, password });  // Make POST request to login
      setAuthTokens(response.data);  // Store tokens in state
      setUser(response.data.user);  // Store user data in state
      localStorage.setItem('authTokens', JSON.stringify(response.data));  // Persist tokens in local storage

      // Set the token in Axios default headers for future requests
      AxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      console.log('Login failed:', error);  // Log error if login fails
      throw error;  // Rethrow the error for the calling component to handle
    }
  };

  // Logout function to clear authentication state
  const logout = () => {
    setAuthTokens(null);  // Clear tokens from state
    setUser(null);  // Clear user from state
    localStorage.removeItem('authTokens');  // Remove tokens from local storage
    delete AxiosInstance.defaults.headers.common['Authorization'];  // Remove token from Axios headers
  };

  // Register function to create a new user
  const register = async (username, password, email) => {
    const response = await AxiosInstance.post('register/', {
      username,
      password,
      email,
    });  // Make POST request to register a new user
    setAuthTokens(response.data);  // Store tokens in state
    setUser(response.data.user);  // Store user data in state
    localStorage.setItem('authTokens', JSON.stringify(response.data));  // Persist tokens in local storage
  };

  // Check if user is authenticated based on the presence of authTokens
  const isAuthenticated = !!authTokens;  // Convert authTokens to boolean

  return (
    // Provide the auth context to the child components
    <AuthContext.Provider value={{ user, authTokens, login, logout, register, isAuthenticated }}>
      {children} 
    </AuthContext.Provider>
  );
};

// Export the AuthContext and AuthProvider for use in other components
export { AuthContext, AuthProvider };
