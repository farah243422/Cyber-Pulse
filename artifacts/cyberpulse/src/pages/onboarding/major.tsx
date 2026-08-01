import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useProtectedRoute } from "@/hooks/use-routes";

export default function OnboardingMajor() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  // Only one discipline available — auto-selected
  const [selected] = useState("Cybersecurity");

  if (isLoading || !user) return null;

  if (!user.studyPlan) {
    setLocation("/onboarding/university");
    return null;
  }

  const handleNext = () => {
    updateUser({ major: selected });
    setLocation("/onboarding/confirmation");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar — Step 3 of 5 */}
      <div className="w-full h-1 bg-card">
        <motion.div initial={{ width: "40%" }} animate={{ width: "60%" }} className="h-full bg-primary" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6">
              <Shield className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Your Discipline</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              CyberPulse is purpose-built for cybersecurity. Your track is pre-configured.
            </p>
          </div>

          {/* Single card — pre-selected */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative flex flex-col items-center p-10 rounded-2xl border border-primary bg-primary/5 shadow-[0_0_40px_-10px_rgba(139,92,246,0.45)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Check badge */}
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Check size={16} strokeWidth={3} className="text-white" />
            </div>

            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-5 z-10">
              <Shield size={40} className="text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-primary mb-2 z-10">Cybersecurity</h2>
            <p className="text-muted-foreground text-sm text-center z-10">
              Offensive &amp; defensive labs, AI-assisted threat analysis, and real-world exploit environments — all tailored to your university curriculum.
            </p>
          </motion.div>

          <div className="mt-12 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/onboarding/university")}
              className="text-muted-foreground"
            >
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              className="h-12 px-8 group glow-primary"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
