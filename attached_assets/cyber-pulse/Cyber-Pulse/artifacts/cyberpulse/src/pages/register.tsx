import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Terminal, Shield, Mail, Lock, User as UserIcon, GraduationCap, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, Role } from "@/context/auth";
import { cn } from "@/lib/utils";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        password,
        role,
        onboardingCompleted: false,
      });
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Registration failed.");
      } else {
        setLocation("/onboarding/university");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Visual left panel */}
      <div className="hidden md:flex w-1/2 bg-card relative overflow-hidden items-center justify-center border-r border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute w-full h-full bg-gradient-to-b from-secondary/10 to-transparent opacity-50" />

        <div className="relative z-10 p-12 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 text-foreground hover:text-primary transition-colors cursor-pointer">
            <Terminal size={28} className="text-primary" />
            <span className="text-2xl font-bold tracking-tight">Cyber<span className="text-primary">Pulse</span></span>
          </Link>
          <h2 className="text-4xl font-bold mb-6">Join the Guild.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Step into the next generation of cybersecurity education. Train with AI, master real vulnerabilities, and prove your capabilities.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="p-2 bg-primary/20 rounded-lg text-primary mt-1">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Industry-Grade Scenarios</h4>
                <p className="text-sm text-muted-foreground">Not just theory. Hack and defend real isolated machines.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary mt-1">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-semibold mb-1">University Aligned</h4>
                <p className="text-sm text-muted-foreground">Connect with your professors and classmates in private cohorts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form right panel */}
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
            <h1 className="text-3xl font-bold mb-2">Create Profile</h1>
            <p className="text-muted-foreground">Initialize your CyberPulse identity.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setRole("Student")}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  role === "Student"
                    ? "border-primary bg-primary/10 text-primary glow-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                )}
              >
                <UserIcon className="mx-auto mb-2" size={24} />
                <div className="font-semibold text-sm">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("Instructor")}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  role === "Instructor"
                    ? "border-secondary bg-secondary/10 text-secondary glow-secondary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-secondary/50"
                )}
              >
                <GraduationCap className="mx-auto mb-2" size={24} />
                <div className="font-semibold text-sm">Instructor</div>
              </button>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <UserIcon size={18} />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Salsabeel Al-Ahmad"
                  className="pl-10 bg-card/50"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Personal Email</Label>
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10 bg-card/50"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        password.length >= i * 3
                          ? i <= 1 ? "bg-destructive" : i === 2 ? "bg-yellow-500" : i === 3 ? "bg-blue-500" : "bg-success"
                          : "bg-border"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full h-12 text-base glow-primary group mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating profile...
                </span>
              ) : (
                <>
                  Initialize Profile
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
