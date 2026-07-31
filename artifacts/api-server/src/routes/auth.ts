import { Router, type Request } from "express";
import { OAuth2Client } from "google-auth-library";
import { logger } from "../lib/logger";
import type { OAuthUser } from "../lib/session";

const authRouter = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getClient(callbackUrl: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  }
  return new OAuth2Client(clientId, clientSecret, callbackUrl);
}

/** Builds the absolute callback URL so Google can redirect back to us. */
function getCallbackUrl(req: Request): string {
  // Explicit override — useful for production deployments
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;

  // Replit dev / deployed domain (preferred)
  const replitDomain =
    process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
  if (replitDomain) return `https://${replitDomain}/api/auth/google/callback`;

  // Fallback for local dev
  const proto =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] as string || req.headers.host || "localhost";
  return `${proto}://${host}/api/auth/google/callback`;
}

/** Where to send the browser after OAuth completes (frontend route). */
function getFrontendBase(req: Request): string {
  const replitDomain =
    process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
  if (replitDomain) return `https://${replitDomain}`;
  const proto =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] as string || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Initiate OAuth 2.0 flow — redirects to Google's consent screen.
 */
authRouter.get("/auth/google", (req, res) => {
  try {
    const callbackUrl = getCallbackUrl(req);
    const client = getClient(callbackUrl);

    // CSRF protection: generate a random state token, store in session
    const state = crypto.randomUUID();
    req.session.oauthState = state;
    req.session.oauthOrigin = (req.query.origin as "login" | "register") || "login";

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account", // always show account picker
    });

    logger.info({ callbackUrl }, "Redirecting to Google OAuth");
    res.redirect(authUrl);
  } catch (err) {
    logger.error({ err }, "Failed to initiate Google OAuth");
    res.redirect("/login?error=config");
  }
});

/**
 * GET /api/auth/google/callback
 * Google redirects here with ?code=... and ?state=...
 */
authRouter.get("/auth/google/callback", async (req, res) => {
  const frontendBase = getFrontendBase(req);

  const redirectError = (code: string) =>
    res.redirect(`${frontendBase}/auth/callback?error=${code}`);

  try {
    const { code, state, error: googleError } = req.query as Record<string, string>;

    // User denied access on Google's consent screen
    if (googleError === "access_denied") {
      return redirectError("access_denied");
    }

    // Validate CSRF state
    const sessionState = req.session.oauthState;
    if (!state || !sessionState || state !== sessionState) {
      logger.warn({ state, sessionState }, "OAuth state mismatch — possible CSRF");
      return redirectError("state_mismatch");
    }
    delete req.session.oauthState; // consume once

    if (!code) {
      return redirectError("no_code");
    }

    // Exchange authorization code for tokens
    const callbackUrl = getCallbackUrl(req);
    const client = getClient(callbackUrl);
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return redirectError("no_id_token");
    }

    // Verify the ID token (validates audience, expiry, signature)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return redirectError("invalid_token");
    }

    // Guard: only allow verified email addresses
    if (!payload.email_verified) {
      return redirectError("email_not_verified");
    }

    // Build our user object from the verified token
    const oauthUser: OAuthUser = {
      id: `google_${payload.sub}`,
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      picture: payload.picture,
      provider: "google",
      onboardingCompleted: false,
    };

    // Save authenticated user to session
    req.session.user = oauthUser;

    logger.info({ email: oauthUser.email, id: oauthUser.id }, "Google OAuth success");

    // Persist session before redirect
    req.session.save((err) => {
      if (err) {
        logger.error({ err }, "Session save failed after OAuth");
        return redirectError("session_error");
      }
      res.redirect(`${frontendBase}/auth/callback`);
    });
  } catch (err) {
    logger.error({ err }, "Google OAuth callback error");
    redirectError("server_error");
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (from session) or 401.
 */
authRouter.get("/auth/me", (req, res) => {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(user);
});

/**
 * POST /api/auth/logout
 * Destroys the server-side session.
 */
authRouter.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Session destroy failed");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("cp_session", { path: "/" });
    res.json({ success: true });
  });
});

export default authRouter;
