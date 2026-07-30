import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { Navbar } from "@/components/navbar";
import StudentDashboard from "./student";
import InstructorDashboard from "./instructor";

export default function DashboardIndex() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/register");
      } else if (!user.onboardingCompleted) {
        if (!user.university)      setLocation("/onboarding/university");
        else if (!user.major)      setLocation("/onboarding/major");
        else if (!user.githubConnected) setLocation("/onboarding/github");
        else                       setLocation("/onboarding/confirmation");
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user || !user.onboardingCompleted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 pb-10">
        {user.role === "Instructor" ? <InstructorDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
}
