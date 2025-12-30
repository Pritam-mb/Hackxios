import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage SYNCHRONOUSLY
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem('token');
  };

  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(false);

  // Log initial state
  useEffect(() => {
    console.log('🔐 AuthContext initialized:', { 
      hasUser: !!user, 
      hasToken: !!token,
      userName: user?.name 
    });
  }, []);

  useEffect(() => {
    // Only verify token if we have one
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && !user) {
      // We have a token but no user, fetch user data
      setLoading(true);
      fetchUser(storedToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async (authToken = token) => {
    try {
      console.log('AuthContext: Fetching user with token');
      // Use authAPI instead of direct fetch
      const data = await authAPI.getMe();

      if (data && data.user) {
        console.log('AuthContext: User fetched successfully', data.user);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.log('AuthContext: Token invalid, logging out');
        // Token is invalid
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Use authAPI instead of direct fetch
      const data = await authAPI.login(email, password);

      if (data && data.token) {
        // Store token and user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set expiry time (7 days from now)
        const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  };

  const register = async (name, email, password, coordinates) => {
    try {
      // Use authAPI instead of direct fetch
      const data = await authAPI.register(name, email, password, coordinates);

      if (data && data.token) {
        // Store token and user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set expiry time (7 days from now)
        const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    setToken(null);
    setUser(null);
  };

  // Check token expiry periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiryTime = localStorage.getItem('tokenExpiry');
      if (expiryTime) {
        const now = new Date().getTime();
        if (now > parseInt(expiryTime)) {
          // Token expired
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    // Check immediately
    checkTokenExpiry();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
