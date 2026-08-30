import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "../types";
import {
  getStoredToken,
  loginUser,
  logoutUser,
  signupUser,
} from "../services/api/authService";

interface DemoUser extends UserProfile {
  password: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activePortal: "citizen" | "officer";
  setActivePortal: (portal: "citizen" | "officer") => void;
  login: (
    identifier: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  demoLogin: (preset: "officer" | "citizen") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "sih_session_token_2026";
const USER_KEY = "sih_active_session_2026";

const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-officer-01",
    name: "Dr. Anjali Sharma",
    email: "anjali.sharma@cpcb.gov.in",
    mobile: "9876543210",
    role: "CPCB Officer / Analyst",
    organization: "Central Pollution Control Board",
    citizenCredibility: 99,
    createdAt: "2026-08-01 10:00",
    password: "Password@123",
  },
  {
    id: "demo-citizen-02",
    name: "Lokesh Satiwada",
    email: "lokesh.satiwada@nitk.edu.in",
    mobile: "9812345678",
    role: "Verified Citizen",
    organization: "NIT Surathkal (Team Carpe diem)",
    citizenCredibility: 94,
    createdAt: "2026-08-15 14:30",
    password: "Password@123",
  },
];

function toProfile(payload: any): UserProfile {
  const user = payload?.user ?? payload;
  return {
    id: String(user?.id || user?._id || `user-${Date.now()}`),
    name: user?.name || "Citizen User",
    email: user?.email || "",
    mobile: user?.phone || user?.mobile || "",
    role: user?.role || "Verified Citizen",
    organization: user?.organization || "Smart City Citizen Inspector",
    citizenCredibility:
      user?.citizenCredibility ?? user?.credibilityScore ?? 90,
    createdAt: user?.createdAt || new Date().toISOString(),
  };
}

function portalFor(user: UserProfile): "citizen" | "officer" {
  return user.role.includes("Officer") || user.role.includes("CPCB")
    ? "officer"
    : "citizen";
}

function persistUser(user: UserProfile | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePortal, setActivePortal] = useState<"citizen" | "officer">(
    "citizen",
  );

  useEffect(() => {
    const storedToken = getStoredToken() || localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as UserProfile;
        setToken(storedToken);
        setUser(parsed);
        setActivePortal(portalFor(parsed));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const applyAuth = (nextUser: UserProfile, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    persistUser(nextUser);
    setActivePortal(portalFor(nextUser));
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await loginUser({ email: identifier.trim(), password });
      if (!response?.user) return { success: false, message: "Login failed." };
      applyAuth(toProfile(response.user), response.token || getStoredToken());
      return { success: true };
    } catch (error) {
      const normalized = identifier.trim().toLowerCase();
      const demo = DEMO_USERS.find(
        (candidate) =>
          (candidate.email.toLowerCase() === normalized ||
            candidate.mobile === normalized) &&
          candidate.password === password,
      );
      if (demo) {
        const { password: _password, ...safeUser } = demo;
        applyAuth(safeUser, `demo-token-${demo.id}`);
        return { success: true };
      }
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invalid credentials. Please try again.",
      };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => {
    try {
      const response = await signupUser(data);
      if (!response?.user)
        return { success: false, message: "Registration failed." };
      applyAuth(toProfile(response.user), response.token || getStoredToken());
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
    setActivePortal("citizen");
  };

  const demoLogin = (preset: "officer" | "citizen") => {
    const demo = preset === "officer" ? DEMO_USERS[0] : DEMO_USERS[1];
    const { password: _password, ...safeUser } = demo;
    applyAuth(safeUser, `demo-token-${demo.id}`);
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
