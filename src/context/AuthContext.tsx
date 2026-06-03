import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiLogin, apiMe, apiSignup, User } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
      apiMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const storeSession = (tok: string, u: User) => {
    localStorage.setItem('auth_token', tok);
    setToken(tok);
    setUser(u);
    setIsGuest(false);
  };

  const login = async (email: string, password: string) => {
    const { token: tok, user: u } = await apiLogin(email, password);
    storeSession(tok, u);
  };

  const signup = async (email: string, password: string, username: string) => {
    const { token: tok, user: u } = await apiSignup(email, password, username);
    storeSession(tok, u);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isGuest, loading, login, signup, logout, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
