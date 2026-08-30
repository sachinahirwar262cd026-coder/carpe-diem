import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { loginApi, registerApi, logoutApi, getMeApi, BackendUser } from '../services/api/authService';

// ── Storage keys ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'carpe_diem_token';
const USER_KEY = 'carpe_diem_user';

// ── Demo users (offline fallback for evaluators) ──────────────────────────
interface DemoUser extends UserProfile {
  _demoPassword: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-officer-01',
    name: 'Dr. Anjali Sharma',
    email: 'anjali.sharma@cpcb.gov.in',
    mobile: '9876543210',
    role: 'CPCB Officer / Analyst',
    organization: 'Central Pollution Control Board',
    citizenCredibility: 99,
    createdAt: '2026-08-01 10:00',
    _demoPassword: 'Password@123',
  },
  {
    id: 'demo-citizen-02',
    name: 'Lokesh Satiwada',
    email: 'lokesh.satiwada@nitk.edu.in',
    mobile: '9812345678',
    role: 'Verified Citizen',
    organization: 'NIT Surathkal (Team Carpe diem)',
    citizenCredibility: 94,
    createdAt: '2026-08-15 14:30',
    _demoPassword: 'Password@123',
  },
];

// ── Adapter: backend user → frontend UserProfile ──────────────────────────
function backendUserToProfile(u: BackendUser & { credibilityScore?: number; phone?: string | null; createdAt?: string }): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.phone || '',
    role: 'Verified Citizen',
    organization: u.isSensitiveGroup ? 'Sensitive Group Member' : 'Smart City Citizen Inspector',
    citizenCredibility: u.credibilityScore ?? 50,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

// ── Context interface ─────────────────────────────────────────────────────
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activePortal: 'citizen' | 'officer';
  setActivePortal: (portal: 'citizen' | 'officer') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  demoLogin: (preset: 'officer' | 'citizen') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePortal, setActivePortal] = useState<'citizen' | 'officer'>('citizen');

  // Helper: persist auth state
  const persistAuth = useCallback((profile: UserProfile, jwt: string) => {
    setUser(profile);
    setToken(jwt);
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    const portalRole = profile.role?.includes('Officer') || profile.role?.includes('CPCB') ? 'officer' : 'citizen';
    setActivePortal(portalRole);
  }, []);

  // Helper: clear auth state
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // On mount: try to rehydrate session from stored token
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUserJson = localStorage.getItem(USER_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Validate token with backend
    getMeApi(storedToken)
      .then((res) => {
        if (res.success && res.data?.user) {
          const profile = backendUserToProfile(res.data.user);
          persistAuth(profile, storedToken);
        } else {
          // Token invalid – fall back to stored user blob (demo mode)
          if (storedUserJson) {
            try {
              const parsed = JSON.parse(storedUserJson) as UserProfile;
              setUser(parsed);
              setToken(storedToken);
              const portalRole = parsed.role?.includes('Officer') || parsed.role?.includes('CPCB') ? 'officer' : 'citizen';
              setActivePortal(portalRole);
            } catch { clearAuth(); }
          } else {
            clearAuth();
          }
        }
      })
      .catch(() => {
        // Backend unreachable – restore from localStorage for offline demo
        if (storedUserJson) {
          try {
            const parsed = JSON.parse(storedUserJson) as UserProfile;
            setUser(parsed);
            setToken(storedToken);
            const portalRole = parsed.role?.includes('Officer') || parsed.role?.includes('CPCB') ? 'officer' : 'citizen';
            setActivePortal(portalRole);
          } catch { clearAuth(); }
        } else {
          clearAuth();
        }
      })
      .finally(() => setIsLoading(false));
  }, [persistAuth, clearAuth]);

  // ── login ──────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    // First try the real backend
    try {
      const res = await loginApi(email, password);
      if (res.success && res.data) {
        const profile = backendUserToProfile(res.data.user);
        persistAuth(profile, res.data.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      // If backend is down, fall back to demo users
      const cleanEmail = email.trim().toLowerCase();
      const demoMatch = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u._demoPassword === password
      );
      if (demoMatch) {
        const { _demoPassword, ...safeUser } = demoMatch;
        persistAuth(safeUser, `demo-token-${demoMatch.id}`);
        return { success: true };
      }
      return {
        success: false,
        message: err.message || 'Invalid credentials. Please verify your Email and Password.',
      };
    }
  };

  // ── register ───────────────────────────────────────────────────────────
  const register = async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.mobile || undefined,
      });
      if (res.success && res.data) {
        const profile = backendUserToProfile(res.data.user);
        persistAuth(profile, res.data.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again.',
      };
    }
  };

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = () => {
    const currentToken = token;
    clearAuth();
    if (currentToken && !currentToken.startsWith('demo-token-')) {
      logoutApi(currentToken); // best-effort, fire-and-forget
    }
  };

  // ── demoLogin (offline, no backend needed) ─────────────────────────────
  const demoLogin = (preset: 'officer' | 'citizen') => {
    const target = preset === 'officer' ? DEMO_USERS[0] : DEMO_USERS[1];
    const { _demoPassword, ...safeUser } = target;
    persistAuth(safeUser, `demo-token-${target.id}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        activePortal,
        setActivePortal,
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
