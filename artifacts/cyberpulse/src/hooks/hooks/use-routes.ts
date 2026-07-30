import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { useLocation } from "wouter";

export function useProtectedRoute(redirectTo: string = "/login") {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation(redirectTo);
    }
  }, [user, isLoading, setLocation, redirectTo]);

  return { user, isLoading };
}

export function useOnboardingRoute() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/register");
      } else if (user.onboardingCompleted) {
        setLocation("/home");
      }
    }
  }, [user, isLoading, setLocation]);

  return { user, isLoading };
}
