import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Building2, BookOpen, Shield, Check, ArrowRight, Clock, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useProtectedRoute } from "@/hooks/use-routes";
import { cn } from "@/lib/utils";

import jadaraLogo from '@/assets/universities/jadara.jpg';
import yarmoukLogo from '@/assets/universities/yarmouk.png';
import petraLogo from '@/assets/universities/petra.png';

const universities = [
  { id: "jadara", name: "Jadara University", arabic: "جامعة جدارا", logo: jadaraLogo },
  { id: "yarmouk", name: "Yarmouk University", arabic: "جامعة اليرموك", logo: yarmoukLogo },
  { id: "petra", name: "University of Petra", arabic: "جامعة البترا", logo: petraLogo }
];

const studyPlans = [
  {
    id: "2025",
    title: "Study Plan 2025",
    credits: 132,
    coreCourses: 24,
    effective: "Fall 2025",
    description: "Updated curriculum featuring advanced cloud security, zero-trust architecture, and AI-driven threat hunting."
  },
  {
    id: "2026",
    title: "Study Plan 2026",
    credits: 135,
    coreCourses: 26,
    effective: "Fall 2026",
    description: "Next-generation plan emphasizing quantum cryptography, IoT security, and embedded systems defense."
  }
];

export default function OnboardingUniversity() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Redirect instructors to their own onboarding page
  useEffect(() => {
    if (!isLoading && user?.role === "Instructor") {
      setLocation("/onboarding/instructor");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;
  if (user.role === "Instructor") return null;

  const canSubmit = !!selectedUniversity && !!selectedPlan;

  const handleComplete = () => {
    if (!canSubmit) return;
    const uni = universities.find(u => u.id === selectedUniversity)!;
    updateUser({
      university: uni.name,
      studyPlan: `Study Plan ${selectedPlan}`,
      major: "Cybersecurity",
    });
    setLocation("/onboarding/confirmation");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-card">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: canSubmit ? "90%" : selectedUniversity ? "50%" : "20%" }}
          transition={{ duration: 0.4 }}
          className="h-full bg-primary"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl space-y-14"
        >
          {/* ── Section 1: University ─────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border">
                <Building2 className="text-secondary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Institution</h2>
                <p className="text-sm text-muted-foreground">Select your university</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {universities.map((uni, idx) => {
                const isSelected = selectedUniversity === uni.id;
                return (
                  <motion.button
                    key={uni.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => setSelectedUniversity(uni.id)}
                    className={cn(
                      "flex flex-col items-center p-6 rounded-2xl border text-center transition-all relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_24px_-8px_rgba(139,92,246,0.4)]"
                        : "border-border bg-card/40 hover:border-primary/50 hover:bg-card"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                    )}
                    <div className="absolute top-3 right-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "border-primary bg-primary text-white" : "border-border bg-background"
                      )}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-4 shadow-md overflow-hidden p-1.5 border border-border">
                      <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className={cn("font-semibold text-base mb-0.5", isSelected ? "text-primary" : "text-foreground")}>
                      {uni.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{uni.arabic}</p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* ── Section 2: Study Plan ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedUniversity ? 1 : 0.35 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border">
                <BookOpen className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Study Plan</h2>
                <p className="text-sm text-muted-foreground">Select your graduation year plan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlans.map((plan, idx) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <motion.button
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.08 }}
                    onClick={() => selectedUniversity && setSelectedPlan(plan.id)}
                    disabled={!selectedUniversity}
                    className={cn(
                      "flex flex-col items-start p-6 rounded-2xl border text-left transition-all relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_24px_-8px_rgba(139,92,246,0.4)]"
                        : "border-border bg-card/40 hover:border-primary/50 hover:bg-card",
                      !selectedUniversity && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                    )}
                    <div className="flex w-full justify-between items-start mb-4">
                      <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary/20 text-primary" : "bg-secondary/10 text-secondary")}>
                        <BookOpen size={20} />
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "border-primary bg-primary text-white" : "border-border bg-background"
                      )}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                    <h3 className={cn("font-bold text-lg mb-2", isSelected ? "text-primary" : "text-foreground")}>
                      {plan.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{plan.description}</p>
                    <div className="grid grid-cols-2 gap-3 w-full mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock size={13} className="text-muted-foreground" />
                        <span className="font-medium">{plan.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Shield size={13} className="text-muted-foreground" />
                        <span className="font-medium">{plan.coreCourses} Core Labs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs col-span-2">
                        <BookMarked size={13} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Effective: {plan.effective}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          {/* ── Section 3: Discipline (auto-selected) ─────────────────────── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedPlan ? 1 : 0.35 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border">
                <Shield className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Discipline</h2>
                <p className="text-sm text-muted-foreground">Your track is pre-configured for CyberPulse</p>
              </div>
            </div>

            <div className="relative flex items-center gap-5 p-6 rounded-2xl border border-primary bg-primary/5 shadow-[0_0_24px_-8px_rgba(139,92,246,0.3)] overflow-hidden max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center z-10 shrink-0">
                <Shield size={24} className="text-primary" />
              </div>
              <div className="z-10">
                <h3 className="font-bold text-primary text-lg">Cybersecurity</h3>
                <p className="text-sm text-muted-foreground">Offensive &amp; defensive labs, AI-assisted threat analysis</p>
              </div>
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                <Check size={11} strokeWidth={3} className="text-white" />
              </div>
            </div>
          </motion.section>

          {/* ── Submit ────────────────────────────────────────────────────── */}
          <div className="flex justify-end pb-12">
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={!canSubmit}
              className={cn("h-12 px-8 group", canSubmit ? "glow-primary" : "")}
            >
              Complete Profile
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
