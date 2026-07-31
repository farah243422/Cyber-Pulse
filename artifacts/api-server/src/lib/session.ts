import session from "express-session";

// ── Session user shape ────────────────────────────────────────────────────────
export interface OAuthUser {
  id: string;          // "google_<sub>"
  name: string;
  email: string;
  picture?: string;
  role?: string;       // determined during onboarding
  onboardingCompleted?: boolean;
  provider: "google";
}

// ── Augment express-session so TypeScript knows our session shape ─────────────
declare module "express-session" {
  interface SessionData {
    user?: OAuthUser;
    oauthState?: string;
    oauthOrigin?: "login" | "register";   // which page initiated the flow
  }
}

// ── Session middleware ────────────────────────────────────────────────────────
const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET env var is required");
}

const isHttps = !!(process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS);

export const sessionMiddleware = session({
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
