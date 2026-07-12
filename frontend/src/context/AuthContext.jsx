/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('token') || '');
  const [worker, setWorkerState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('worker') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncAuth = () => {
      setTokenState(localStorage.getItem('token') || '');
      try {
        setWorkerState(JSON.parse(localStorage.getItem('worker') || 'null'));
      } catch {
        setWorkerState(null);
      }
    };

    window.addEventListener('storage', syncAuth);
    window.addEventListener('authchange', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authchange', syncAuth);
    };
  }, []);

  const setAuth = (nextToken, nextWorker) => {
    if (nextToken) {
      localStorage.setItem('token', nextToken);
    } else {
      localStorage.removeItem('token');
    }

    if (nextWorker) {
      localStorage.setItem('worker', JSON.stringify(nextWorker));
    } else {
      localStorage.removeItem('worker');
    }

    setTokenState(nextToken || '');
    setWorkerState(nextWorker || null);
    window.dispatchEvent(new Event('authchange'));
  };

  const clearAuth = () => setAuth('', null);

  const value = useMemo(() => ({
    token,
    worker,
    setAuth,
    clearAuth,
    isAuthenticated: Boolean(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [token, worker]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
