import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('myportfolio_token') || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('myportfolio_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('myportfolio_token', nextToken);
    } else {
      localStorage.removeItem('myportfolio_token');
    }

    if (nextUser) {
      localStorage.setItem('myportfolio_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('myportfolio_user');
    }
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    persistAuth('', null);
  }, [persistAuth]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const payload = await apiFetch('/me', { method: 'GET' }, token);
        setUser(payload);
        persistAuth(token, payload);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [logout, persistAuth, token]);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    persistAuth(nextToken, nextUser);
  }, [persistAuth]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  }), [loading, login, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

export default AuthProvider;
