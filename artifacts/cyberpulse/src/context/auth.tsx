import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Student' | 'Instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  university?: string;
  studyPlan?: string;
  major?: string;
  githubConnected?: boolean;
  githubUsername?: string;
  onboardingCompleted?: boolean;
  picture?: string;       // Google profile photo URL
  provider?: 'google';    // set for OAuth users
}

// Stored with password for local simulation (email/password flow)
interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (user: User & { password: string }) => { success: boolean; error?: string };
  loginWithGoogle: (oauthUser: OAuthUserPayload) => { isNewUser: boolean };
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

// Shape returned by GET /api/auth/me
interface OAuthUserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: 'google';
  onboardingCompleted?: boolean;
}

const USERS_KEY = 'cyberpulse_users';
const SESSION_KEY = 'cyberpulse_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage — cleared on tab/webview close so
    // stale sessions never auto-log in across new visits.
    const storedUser = sessionStorage.getItem(SESSION_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ── Email / password login ────────────────────────────────────────────────────
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = getStoredUsers();
    const byEmail = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!byEmail) {
      return { success: false, error: 'No account found. Please create an account first.' };
    }
    if (byEmail.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    const { password: _pw, ...userData } = byEmail;
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  };

  // ── Email / password registration ────────────────────────────────────────────
  // Saves the account to the user store AND creates a session immediately so
  // the user is auto-logged in after sign-up (no second login required).
  const register = (userData: User & { password: string }): { success: boolean; error?: string } => {
    const users = getStoredUsers();
    const exists = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }
    saveStoredUsers([...users, { ...userData }]);
    // Auto-login: start a session immediately after registration
    const { password: _pw, ...sessionData } = userData;
    setUser(sessionData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return { success: true };
  };

  // ── Google OAuth login (new) ──────────────────────────────────────────────────
  /**
   * Called by the /auth/callback page after a successful Google OAuth flow.
   * Merges the OAuth payload into the existing user store (or auto-registers
   * a new record) then starts a local session identical to email/password login.
   *
   * Returns { isNewUser } so the caller knows where to redirect.
   */
  const loginWithGoogle = (oauthUser: OAuthUserPayload): { isNewUser: boolean } => {
    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === oauthUser.email.toLowerCase()
    );

    let sessionUser: User;

    if (existing) {
      // Merge any new OAuth fields (picture, provider) into the existing record
      const merged: StoredUser = {
        ...existing,
        picture: oauthUser.picture ?? existing.picture,
        provider: 'google',
      };
      saveStoredUsers(users.map((u) => (u.id === existing.id ? merged : u)));
      const { password: _pw, ...withoutPw } = merged;
      sessionUser = withoutPw;
    } else {
      // First-time Google login — auto-register with an empty password
      const newRecord: StoredUser = {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email,
        picture: oauthUser.picture,
        provider: 'google',
        role: 'Student',           // default; user picks during onboarding
        onboardingCompleted: false,
        password: '',              // no password for OAuth users
      };
      saveStoredUsers([...users, newRecord]);
      const { password: _pw, ...withoutPw } = newRecord;
      sessionUser = withoutPw;
    }

    setUser(sessionUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    const isNewUser = !existing || !existing.onboardingCompleted;
    return { isNewUser };
  };

  // ── Update profile ────────────────────────────────────────────────────────────
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));

      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveStoredUsers(users);
      }
      return updated;
    });
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    // Best-effort: tell the server to destroy the OAuth session cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Non-fatal — local state is cleared regardless
    }
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
