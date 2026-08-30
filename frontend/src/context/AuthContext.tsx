import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";
import { loginUser, signupUser, logoutUser } from "../services/api/authService";

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface AuthContextType {
  user: UserProfile | null;
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

const DEFAULT_DEMO_USERS: StoredUser[] = [
  {
    id: "usr-cpcb-01",
    name: "Dr. Anjali Sharma",
    email: "anjali.sharma@cpcb.gov.in",
    mobile: "9876543210",
    passwordHash: "Password@123",
    role: "CPCB Officer / Analyst",
    organization: "Central Pollution Control Board",
    citizenCredibility: 99,
    createdAt: "2026-08-01 10:00",
  },
  {
    id: "usr-cit-02",
    name: "Lokesh Satiwada",
    email: "lokesh.satiwada@nitk.edu.in",
    mobile: "9812345678",
    passwordHash: "Password@123",
    role: "Verified Citizen",
    organization: "NIT Surathkal (Team Carpe diem)",
    citizenCredibility: 94,
    createdAt: "2026-08-15 14:30",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "sih_registered_users_2026";
const CURRENT_USER_KEY = "sih_active_session_2026";

const persistUser = (user: UserProfile | null) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const buildUserFromApi = (payload: any): UserProfile => {
  const user = payload?.user ?? payload;

  return {
    id: String(user?.id || user?._id || "user-" + Date.now()),
    name: user?.name || "Citizen User",
    email: user?.email || "",
    mobile: user?.phone || user?.mobile || "",
    role: user?.role || "Verified Citizen",
    organization: user?.organization || "Smart City Citizen Inspector",
    citizenCredibility:
      user?.citizenCredibility ?? user?.credibilityScore ?? 90,
    createdAt: user?.createdAt || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePortal, setActivePortal] = useState<"citizen" | "officer">(
    "citizen",
  );

  useEffect(() => {
    try {
      const existingUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existingUsersJson) {
        localStorage.setItem(
          USERS_STORAGE_KEY,
          JSON.stringify(DEFAULT_DEMO_USERS),
        );
      }

      const activeSessionJson = localStorage.getItem(CURRENT_USER_KEY);
      if (activeSessionJson) {
        const parsed = JSON.parse(activeSessionJson);
        setUser(parsed);
        setActivePortal(
          parsed.role && parsed.role.includes("Officer")
            ? "officer"
            : "citizen",
        );
      } else {
        const defaultUser = DEFAULT_DEMO_USERS[0];
        const { passwordHash, ...safeUser } = defaultUser;
        persistUser(safeUser);
        setUser(safeUser);
        setActivePortal("officer");
      }
    } catch (e) {
      console.error("Failed to load auth from localStorage", e);
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

  const fallbackLocalLogin = (
    identifier: string,
    password: string,
  ): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const users = getRegisteredUsers();

    const matchedUser = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.mobile === cleanId) &&
        u.passwordHash === password,
    );

    if (!matchedUser) {
      return {
        success: false,
        message:
          "Invalid credentials. Please verify your Email/Mobile and Password.",
      };
    }

    const { passwordHash, ...safeUser } = matchedUser;
    setUser(safeUser);
    persistUser(safeUser);
    setActivePortal(
      safeUser.role && safeUser.role.includes("Officer")
        ? "officer"
        : "citizen",
    );
    return { success: true };
  };

  const login = async (
    identifier: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanIdentifier = identifier.trim();
    const email = cleanIdentifier.includes("@")
      ? cleanIdentifier
      : cleanIdentifier;

    try {
      const response = await loginUser({ email, password });
      const nextUser = buildUserFromApi(response);
      setUser(nextUser);
      persistUser(nextUser);
      setActivePortal(
        nextUser.role && nextUser.role.includes("Officer")
          ? "officer"
          : "citizen",
      );
      return { success: true };
    } catch (error) {
      const fallback = fallbackLocalLogin(cleanIdentifier, password);
      if (fallback.success) return fallback;

      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend authentication service.";
      return {
        success: false,
        message:
          message.includes("401") || message.includes("Invalid")
            ? "Invalid credentials. Please verify your Email/Mobile and Password."
            : "Unable to connect to the backend authentication service. Please try again or use the demo login.",
      };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await signupUser({
        name: data.name,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
      });
      const nextUser = buildUserFromApi(response);
      setUser(nextUser);
      persistUser(nextUser);
      setActivePortal("citizen");
      return { success: true };
    } catch (error) {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanMobile = data.mobile.trim();
      const users = getRegisteredUsers();

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return {
          success: false,
          message: "An account with this Email ID already exists.",
        };
      }
      if (users.some((u) => u.mobile === cleanMobile)) {
        return {
          success: false,
          message: "An account with this Mobile Number already exists.",
        };
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to reach the backend registration service.";
      return { success: false, message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // Ignore backend logout errors and clear local session anyway.
    } finally {
      setUser(null);
      persistUser(null);
      setActivePortal("citizen");
    }
  };

  const demoLogin = (preset: "officer" | "citizen") => {
    const target =
      preset === "officer" ? DEFAULT_DEMO_USERS[0] : DEFAULT_DEMO_USERS[1];
    const { passwordHash, ...safeUser } = target;
    setUser(safeUser);
    persistUser(safeUser);
    setActivePortal(preset === "officer" ? "officer" : "citizen");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
