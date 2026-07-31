import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Terminal, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";

// Human-readable error messages for each error code the backend may send.
const ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "You cancelled the Google sign-in. No account was created or accessed.",
  state_mismatch:
    "The sign-in request expired or was tampered with. Please try again.",
  no_code:
    "Google didn't return an authorisation code. Please try again.",
  no_id_token:
    "We couldn't verify your identity with Google. Please try again.",
  invalid_token:
    "Your Google account token couldn't be verified. Please sign in again.",
  email_not_verified:
    "Your Google account's email is not verified. Please verify it with Google and try again.",
  session_error:
    "A session error occurred. Please clear cookies and try again.",
  config:
    "Google Sign-In is not configured yet. Please contact support.",
  server_error:
    "An unexpected error occurred. Please try again in a moment.",
};

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { loginWithGoogle } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");

    if (errorCode) {
      setErrorMessage(
        ERROR_MESSAGES[errorCode] ||
          "An unknown error occurred during sign-in. Please try again."
      );
      setStatus("error");
      return;
    }

    // No error — fetch the authenticated user from the server session
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // send the httpOnly session cookie
        });

        if (!res.ok) {
          throw new Error(`/api/auth/me returned ${res.status}`);
        }

        const oauthUser = await res.json();

        // Hand off to AuthContext; it handles localStorage + React state
        const { isNewUser } = loginWithGoogle(oauthUser);

        setStatus("success");

        // Brief success flash, then route appropriately
        setTimeout(() => {
          setLocation(isNewUser ? "/onboarding/university" : "/dashboard");
        }, 900);
      } catch (err) {
        console.error("AuthCallback fetch error:", err);
        setErrorMessage(
          "We couldn't retrieve your account details. Please try signing in again."
        );
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-12 text-foreground">
        <Terminal size={28} className="text-primary" />
        <span className="text-2xl font-bold tracking-tight">
          Cyber<span className="text-primary">Pulse</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Signing you in…</h2>
              <p className="text-sm text-muted-foreground">
                Verifying your Google account.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center"
            >
              <CheckCircle2 size={28} className="text-success" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Signed in!</h2>
              <p className="text-sm text-muted-foreground">Redirecting you now…</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertCircle size={28} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Sign-in failed</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
