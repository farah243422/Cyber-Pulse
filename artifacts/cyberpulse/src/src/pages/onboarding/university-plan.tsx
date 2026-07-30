import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Check, ArrowRight, Clock, BookMarked, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useProtectedRoute } from "@/hooks/use-routes";
import { cn } from "@/lib/utils";

import jadaraLogo from '@/assets/universities/jadara.jpg';
import yarmoukLogo from '@/assets/universities/yarmouk.png';
import petraLogo from '@/assets/universities/petra.png';

const universityData: Record<string, { name: string; logo: string; arabic: string }> = {
  jadara: { name: "Jadara University", arabic: "جامعة جدارا", logo: jadaraLogo },
  yarmouk: { name: "Yarmouk University", arabic: "جامعة اليرموك", logo: yarmoukLogo },
  petra: { name: "University of Petra", arabic: "جامعة البترا", logo: petraLogo }
};

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

export default function OnboardingUniversityPlan() {
  const { user, isLoading } = useProtectedRoute("/register");
  const [, setLocation] = useLocation();
  const params = useParams<{ universityId: string }>();
  const { updateUser } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (isLoading || !user) return null;

  // Protect route: if no university selected, redirect back
  if (!user.university) {
    setLocation("/onboarding/university");
    return null;
  }

  const uniId = params.universityId || "petra";
  const uni = universityData[uniId] || universityData.petra;

  const handleNext = () => {
    if (selectedPlan) {
      updateUser({ studyPlan: `Study Plan ${selectedPlan}` });
      setLocation("/onboarding/major");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Progress Bar - Step 2 of 5 (40%) */}
      <div className="w-full h-1 bg-card">
        <motion.div 
          initial={{ width: "20%" }}
          animate={{ width: "40%" }}
          className="h-full bg-primary"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-xl p-2 border border-border">
              <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{uni.name}</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select your effective study plan year. This determines your required core courses and lab environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyPlans.map((plan, idx) => {
              const isSelected = selectedPlan === plan.id;
              
              return (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "flex flex-col items-start p-8 rounded-2xl border text-left transition-all h-full relative overflow-hidden group",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-[0_0_30px_-10px_rgba(139,92,246,0.4)]" 
                      : "border-border bg-card/40 hover:border-primary/50 hover:bg-card"
                  )}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                  )}
                  
                  <div className="flex w-full justify-between items-start mb-6">
                    <div className={cn("p-3 rounded-xl", isSelected ? "bg-primary/20 text-primary" : "bg-secondary/10 text-secondary")}>
                      <BookOpen size={28} />
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                      isSelected ? "border-primary bg-primary text-white" : "border-border bg-background"
                    )}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                  
                  <h3 className={cn("font-bold text-2xl mb-3", isSelected ? "text-primary" : "text-foreground")}>
                    {plan.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="font-medium">{plan.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield size={16} className="text-muted-foreground" />
                      <span className="font-medium">{plan.coreCourses} Core Labs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <BookMarked size={16} className="text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">Effective: {plan.effective}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

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
              disabled={!selectedPlan}
              className={cn("h-12 px-8 group", selectedPlan ? "glow-primary" : "")}
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
