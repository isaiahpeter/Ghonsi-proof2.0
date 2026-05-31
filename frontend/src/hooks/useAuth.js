import { useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, isAuthenticated, getCurrentUser } from '@/utils/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUser(getCurrentUser());
      }
    };
    checkAuth();
  }, []);

  const login = (email, walletAddress) => {
    authLogin(email, walletAddress);
    setIsLoggedIn(true);
    setUser(getCurrentUser());
  };

  const logout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return { isLoggedIn, user, login, logout };
};