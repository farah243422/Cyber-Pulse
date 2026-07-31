import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { useProtectedRoute } from "@/hooks/use-routes";
import { cn } from "@/lib/utils";

export default function OnboardingGithub() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();
  
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");

  if (isLoading || !user) return null;

  // Route guard
  if (!user.major) {
    setLocation("/onboarding/major");
    return null;
  }

  const handleConnect = () => {
    setConnecting(true);
    // Simulate OAuth handshake delay, then let the user enter their real username
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1500);
  };

  const handleNext = () => {
    if (connected && username) {
      updateUser({ 
        githubConnected: true,
        githubUsername: username 
      });
      setLocation("/onboarding/confirmation");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Top Progress Bar - Step 4 of 5 (80%) */}
      <div className="w-full h-1 bg-card">
        <motion.div 
          initial={{ width: "60%" }}
          animate={{ width: "80%" }}
          className="h-full bg-primary"
        />
      </div>

      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none opacity-40" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border mb-6 shadow-xl relative">
              <SiGithub className="text-foreground" size={40} />
              {connected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 bg-success text-white rounded-full p-1 border-2 border-background"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Link Your Portfolio</h1>
            <p className="text-muted-foreground">
              CyberPulse automatically syncs your conquered labs and certifications to your GitHub profile as verifiable proof of your skills.
            </p>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
            {!connected ? (
              <div className="flex flex-col items-center">
                <Button 
                  size="lg" 
                  onClick={handleConnect} 
                  disabled={connecting}
                  className="w-full h-14 text-base relative overflow-hidden group bg-white text-black hover:bg-gray-200"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting to GitHub...
                    </>
                  ) : (
                    <>
                      <SiGithub className="mr-3 h-5 w-5" />
                      Connect GitHub Account
                    </>
                  )}
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">
                  By connecting, you allow CyberPulse to create a dedicated repository for your achievements.
                </p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col space-y-4 text-left"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl border border-success/30 bg-success/5 mb-2">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-success">Account Linked Successfully</p>
                    <p className="text-xs text-muted-foreground">CyberPulse is authorized.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">GitHub Username</label>
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 bg-background border-border"
                      placeholder="Enter your username"
                    />
                    <p className="text-xs text-muted-foreground">
                      Confirm your username so we can display your profile link.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Profile Link</label>
                    <div className="flex items-center gap-2 h-12 px-3 rounded-md border border-border bg-muted/30 text-muted-foreground text-sm overflow-hidden">
                      <ExternalLink size={16} className="shrink-0" />
                      <span className="truncate">
                        github.com/{username || "username"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-12 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/onboarding/major")}
              className="text-muted-foreground"
            >
              Back
            </Button>
            <Button 
              size="lg" 
              onClick={handleNext} 
              disabled={!connected || !username}
              className={cn("h-12 px-8 group", connected ? "glow-primary" : "")}
            >
              Complete Setup
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
