import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Check, ArrowRight } from "lucide-react";
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

export default function OnboardingInstructor() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  if (isLoading || !user) return null;

  const handleComplete = () => {
    if (!selectedUniversity) return;
    const uni = universities.find(u => u.id === selectedUniversity)!;
    updateUser({ university: uni.name });
    setLocation("/onboarding/confirmation");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-card">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: selectedUniversity ? "80%" : "30%" }}
          transition={{ duration: 0.4 }}
          className="h-full bg-secondary"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6">
              <GraduationCap className="text-secondary" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Instructor Setup</h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Link your profile to your institution so your students can join your cohort.
            </p>
          </div>

          {/* University selection */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Building2 size={18} className="text-muted-foreground" />
              <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Your Institution</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {universities.map((uni, idx) => {
                const isSelected = selectedUniversity === uni.id;
                return (
                  <motion.button
                    key={uni.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedUniversity(uni.id)}
                    className={cn(
                      "flex flex-col items-center p-8 rounded-2xl border text-center transition-all relative overflow-hidden group",
                      isSelected
                        ? "border-secondary bg-secondary/5 shadow-[0_0_30px_-10px_rgba(6,182,212,0.4)]"
                        : "border-border bg-card/40 hover:border-secondary/50 hover:bg-card"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none" />
                    )}
                    <div className="absolute top-4 right-4">
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "border-secondary bg-secondary text-white" : "border-border bg-background"
                      )}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-md overflow-hidden p-2 border border-border">
                      <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className={cn("font-semibold text-xl mb-1", isSelected ? "text-secondary" : "text-foreground")}>
                      {uni.name}
                    </h3>
                    <p className="text-muted-foreground font-medium">{uni.arabic}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={!selectedUniversity}
              className={cn(
                "h-12 px-8 group",
                selectedUniversity
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_20px_-6px_rgba(6,182,212,0.5)]"
                  : ""
              )}
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
