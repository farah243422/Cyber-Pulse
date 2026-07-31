import { useEffect } from "react";
import { useAuth, type Role } from "@/context/auth";
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

/**
 * Enforces role-based access control.
 * - Unauthenticated users → /login
 * - Authenticated users with the wrong role → `redirectTo` (default: /dashboard)
 *
 * Call this at the top of any component or page that is restricted to a
 * specific role. Always check the returned `user` and `hasRole` before
 * rendering sensitive content.
 */
export function useRoleRoute(requiredRole: Role, redirectTo: string = "/dashboard") {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role !== requiredRole) {
        setLocation(redirectTo);
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, setLocation]);

  const hasRole = user?.role === requiredRole;
  return { user, isLoading, hasRole };
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
