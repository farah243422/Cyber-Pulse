import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Lock, Mail, ArrowRight, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Login failed.");
      } else {
        setLocation("/dashboard");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ── Visual left panel ─────────────────────────────────────────────── */}
      <div className="hidden md:flex w-1/2 bg-card relative overflow-hidden items-center justify-center border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute w-full h-full bg-gradient-to-b from-primary/10 to-transparent opacity-50" />

        <div className="relative z-10 p-12 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 text-foreground hover:text-primary transition-colors cursor-pointer">
            <Terminal size={28} className="text-primary" />
            <span className="text-2xl font-bold tracking-tight">Cyber<span className="text-primary">Pulse</span></span>
          </Link>
          <h2 className="text-4xl font-bold mb-6">Welcome Back, Operative.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Resume your training. Access your practical labs, track your performance, and continue building your cybersecurity portfolio.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <Shield className="text-secondary mb-2" size={24} />
              <h4 className="font-semibold text-sm mb-1">Secure Labs</h4>
              <p className="text-xs text-muted-foreground">Isolated, real-world exploit environments.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <Terminal className="text-primary mb-2" size={24} />
              <h4 className="font-semibold text-sm mb-1">AI Guided</h4>
              <p className="text-xs text-muted-foreground">Context-aware hints when you get stuck.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form right panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-6 md:hidden inline-flex items-center gap-2 text-foreground">
          <Terminal size={24} className="text-primary" />
          <span className="text-xl font-bold tracking-tight">Cyber<span className="text-primary">Pulse</span></span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Sign In</h1>
            <p className="text-muted-foreground">Access your CyberPulse terminal.</p>
          </div>

          {/* ── Primary actions: Google + Create Account ───────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a href="/api/auth/google?origin=login" className="flex-1">
              <Button type="button" className="w-full h-12 text-base glow-primary flex items-center gap-2">
                <GoogleIcon />
                Sign in with Google
              </Button>
            </a>
            <Link href="/register" className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                Create Account
              </Button>
            </Link>
          </div>

          {/* ── Email toggle ───────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => { setShowEmailForm((v) => !v); setError(""); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 mx-auto"
          >
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${showEmailForm ? "rotate-180" : ""}`}
            />
            Sign in with email instead
          </button>

          {/* ── Email / password form (collapsible) ───────────────────────── */}
          <AnimatePresence>
            {showEmailForm && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-1">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@gmail.com"
                        className="pl-10 bg-card/50"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-card/50"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>
                        {error}
                        {error.includes("register") && (
                          <Link href="/register" className="ml-1 underline font-medium hover:opacity-80">
                            Create account →
                          </Link>
                        )}
                      </span>
                    </motion.div>
                  )}

                  <Button type="submit" className="w-full h-12 text-base glow-primary group" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
