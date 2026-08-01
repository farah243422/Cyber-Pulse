import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/context/auth';

// Pages
import Splash from '@/pages/splash';
import Home from '@/pages/home';
import Login from '@/pages/login';
import Register from '@/pages/register';
import AuthCallback from '@/pages/auth-callback';
import OnboardingUniversity from '@/pages/onboarding/university';
import OnboardingUniversityPlan from '@/pages/onboarding/university-plan';
import OnboardingMajor from '@/pages/onboarding/major';
import OnboardingGithub from '@/pages/onboarding/github';
import OnboardingInstructor from '@/pages/onboarding/instructor';
import OnboardingConfirmation from '@/pages/onboarding/confirmation';
import Dashboard from '@/pages/dashboard';
import LabDetail from '@/pages/lab-detail';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* OAuth 2.0 callback — Google redirects here after authentication */}
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/lab/:labId" component={LabDetail} />
      <Route path="/onboarding/university" component={OnboardingUniversity} />
      <Route path="/onboarding/university/:universityId" component={OnboardingUniversityPlan} />
      <Route path="/onboarding/major" component={OnboardingMajor} />
      <Route path="/onboarding/github" component={OnboardingGithub} />
      <Route path="/onboarding/instructor" component={OnboardingInstructor} />
      <Route path="/onboarding/confirmation" component={OnboardingConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
