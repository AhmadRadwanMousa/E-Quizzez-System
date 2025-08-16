import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper function to get the current token
  const getToken = () => {
    if (isAdmin) {
      return localStorage.getItem('adminToken');
    } else {
      return localStorage.getItem('token');
    }
  };

  useEffect(() => {
    // Check if user is already logged in and validate tokens
    const validateAndSetAuth = async () => {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('user');
      const adminData = localStorage.getItem('adminUser');
      
      if (token && userData) {
        try {
          // Validate student token
          const response = await axios.get('/api/auth/validate', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setUser(JSON.parse(userData));
            setAdminUser(null);
            setIsAuthenticated(true);
            setIsAdmin(false);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else if (adminToken && adminData) {
        try {
          // Validate admin token
          const response = await axios.get('/api/auth/admin/validate', {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          
          if (response.data.success) {
            setAdminUser(JSON.parse(adminData));
            setUser(null);
            setIsAuthenticated(true);
            setIsAdmin(true);
            axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Admin token validation failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
      
      setLoading(false);
    };

    validateAndSetAuth();
  }, []);

  const login = async (studentId, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        student_id: studentId,
        password: password
      });

      const { token, student } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(student));
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(student);
      setAdminUser(null);
      setIsAuthenticated(true);
      setIsAdmin(false);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/admin/login', {
        email: email,
        password: password
      });

      const { token, admin } = response.data.data;
      
      // Store admin token and data (simplified storage)
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setAdminUser(admin);
      setUser(null);
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    setUser(null);
    setAdminUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    adminUser,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    loginAdmin,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
