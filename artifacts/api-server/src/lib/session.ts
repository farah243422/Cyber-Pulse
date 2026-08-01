import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

// ── Unified session user ───────────────────────────────────────────────────────
// Covers both email/password accounts and Google OAuth accounts.
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: string;
  university?: string;
  studyPlan?: string;
  major?: string;
  githubConnected?: boolean;
  githubUsername?: string;
  onboardingCompleted?: boolean;
  provider?: "google";   // only present for Google OAuth users
}

// Backwards-compat alias used by the Google OAuth flow in auth.ts
export type OAuthUser = SessionUser & { provider: "google" };

// ── Augment express-session ────────────────────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
    oauthState?: string;
    oauthOrigin?: "login" | "register";
    githubOAuthState?: string;
  }
}

// ── Session middleware ─────────────────────────────────────────────────────────
const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET env var is required");
}

const isHttps = !!(process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS);

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  name: "cp_session",
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  },
});
