import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Terminal } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useProtectedRoute } from "@/hooks/use-routes";

export default function OnboardingConfirmation() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  // Route guard
  useEffect(() => {
    if (!isLoading && user) {
      if (!user.githubConnected) {
        setLocation("/onboarding/github");
      } else if (!user.onboardingCompleted) {
        // Mark onboarding as completed
        updateUser({ onboardingCompleted: true });
      }
    }
  }, [user, isLoading, setLocation, updateUser]);

  if (isLoading || !user || !user.githubConnected) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Top Progress Bar - Step 5 of 5 (100%) */}
      <div className="w-full h-1 bg-card">
        <motion.div 
          initial={{ width: "80%" }}
          animate={{ width: "100%" }}
          className="h-full bg-success"
        />
      </div>

      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-lg text-center"
        >
          <div className="relative inline-block mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
              className="absolute -inset-4 bg-success/20 rounded-full blur-xl"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
              className="relative w-24 h-24 bg-card border border-success/50 rounded-2xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]"
            >
              <CheckCircle2 className="text-success" size={48} strokeWidth={1.5} />
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold mb-4 tracking-tight">Identity Confirmed</h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Welcome to <span className="text-foreground font-semibold">CyberPulse</span>, {user.name.split(' ')[0]}.<br/>
            Your profile is fully initialized and synced.
          </p>

          <div className="bg-card/50 border border-border/50 rounded-2xl p-6 text-left mb-10 mx-auto backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground text-sm font-mono uppercase">Role</span>
              <span className="font-medium text-primary">{user.role}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground text-sm font-mono uppercase">Institution</span>
              <span className="font-medium truncate max-w-[200px] text-right" title={user.university}>{user.university}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground text-sm font-mono uppercase">Study Plan</span>
              <span className="font-medium text-secondary">{user.studyPlan}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground text-sm font-mono uppercase">Discipline</span>
              <span className="font-medium">{user.major}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-mono uppercase flex items-center gap-2">
                <SiGithub className="text-muted-foreground" />
                Portfolio
              </span>
              <span className="font-medium font-mono text-sm">github.com/{user.githubUsername}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button 
              size="lg" 
              onClick={() => setLocation("/dashboard")}
              className="h-14 px-10 text-lg glow-primary group"
            >
              <Terminal className="mr-2 w-5 h-5" />
              Access Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
