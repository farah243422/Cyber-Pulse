import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Terminal, Shield, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

          {/* ── Email / password form ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="text-center text-sm text-muted-foreground pt-2">
              No account yet?{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Create Account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
