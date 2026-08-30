import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface StoredUser extends UserProfile {
  passwordHash: string; // Plain/Base64 for frontend prototype
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activePortal: 'citizen' | 'officer';
  setActivePortal: (portal: 'citizen' | 'officer') => void;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  register: (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => { success: boolean; message?: string };
  logout: () => void;
  demoLogin: (preset: 'officer' | 'citizen') => void;
}

const DEFAULT_DEMO_USERS: StoredUser[] = [
  {
    id: 'usr-cpcb-01',
    name: 'Dr. Anjali Sharma',
    email: 'anjali.sharma@cpcb.gov.in',
    mobile: '9876543210',
    passwordHash: 'Password@123',
    role: 'CPCB Officer / Analyst',
    organization: 'Central Pollution Control Board',
    citizenCredibility: 99,
    createdAt: '2026-08-01 10:00',
  },
  {
    id: 'usr-cit-02',
    name: 'Lokesh Satiwada',
    email: 'lokesh.satiwada@nitk.edu.in',
    mobile: '9812345678',
    passwordHash: 'Password@123',
    role: 'Verified Citizen',
    organization: 'NIT Surathkal (Team Carpe diem)',
    citizenCredibility: 94,
    createdAt: '2026-08-15 14:30',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'sih_registered_users_2026';
const CURRENT_USER_KEY = 'sih_active_session_2026';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePortal, setActivePortal] = useState<'citizen' | 'officer'>('citizen');

  // Initialize stored users and session on mount
  useEffect(() => {
    try {
      const existingUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existingUsersJson) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      }

      const activeSessionJson = localStorage.getItem(CURRENT_USER_KEY);
      if (activeSessionJson) {
        const parsed = JSON.parse(activeSessionJson);
        setUser(parsed);
        if (parsed.role && parsed.role.includes('Officer')) {
          setActivePortal('officer');
        } else {
          setActivePortal('citizen');
        }
      } else {
        const defaultUser = DEFAULT_DEMO_USERS[0];
        const { passwordHash, ...safeUser } = defaultUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        setUser(safeUser);
        setActivePortal('officer');
      }
    } catch (e) {
      console.error('Failed to load auth from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const json = localStorage.getItem(USERS_STORAGE_KEY);
      if (!json) return DEFAULT_DEMO_USERS;
      return JSON.parse(json);
    } catch {
      return DEFAULT_DEMO_USERS;
    }
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const users = getRegisteredUsers();

    const matchedUser = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.mobile === cleanId) &&
        u.passwordHash === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Invalid credentials. Please verify your Email/Mobile and Password.',
      };
    }

    const { passwordHash, ...safeUser } = matchedUser;
    setUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    if (safeUser.role && safeUser.role.includes('Officer')) {
      setActivePortal('officer');
    } else {
      setActivePortal('citizen');
    }
    return { success: true };
  };

  const register = (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): { success: boolean; message?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanMobile = data.mobile.trim();
    const users = getRegisteredUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this Email ID already exists.' };
    }

    if (users.some((u) => u.mobile === cleanMobile)) {
      return { success: false, message: 'An account with this Mobile Number already exists.' };
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash: data.password,
      role: 'Verified Citizen',
      organization: 'Smart City Citizen Inspector',
      citizenCredibility: 90,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    const { passwordHash, ...safeUser } = newUser;
    setUser(safeUser);
    setActivePortal('citizen');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const demoLogin = (preset: 'officer' | 'citizen') => {
    const target = preset === 'officer' ? DEFAULT_DEMO_USERS[0] : DEFAULT_DEMO_USERS[1];
    const { passwordHash, ...safeUser } = target;
    setUser(safeUser);
    setActivePortal(preset === 'officer' ? 'officer' : 'citizen');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
