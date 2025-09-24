import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Doctors from "@/pages/doctors";
import Tracking from "@/pages/tracking";
import Fitness from "@/pages/fitness";
import TrainerProfile from "@/pages/trainer-profile";
import Subscribe from "@/pages/subscribe";
import Settings from "@/pages/settings";
import AIDoc from "@/pages/ai-doc";
import AI from "@/pages/ai";
import SimpleSignup from "@/pages/simple-signup";
import ChatHistory from "@/pages/chat-history";
import Profile from "@/pages/profile";
import Pulse from "@/pages/pulse";
import ElderCare from "@/pages/elder-care";
import About from "@/pages/about";
import Team from "@/pages/team";
import Market from "@/pages/market";
import BookPage from "@/pages/book";
import PrescriptionsForm from "@/pages/prescriptions-form";
import FoodFeed from "@/pages/food";
import HealthTipsSubscription from "@/pages/health-tips-subscription";
import AuthPage from "@/pages/auth-page";
import AppLogin from "@/pages/app-login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import CaseManagerLogin from "@/pages/case-manager-login";
import CaseManagerDashboard from "@/pages/case-manager-dashboard";
import CustomerServiceLogin from "@/pages/customer-service-login";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import PresiboManagerLogin from "@/pages/presibo-manager-login";
import PresiboManagerDashboard from "@/pages/presibo-manager-dashboard";
import DoctorLogin from "@/pages/doctor-login";
import DoctorResetPassword from "@/pages/doctor-reset-password";
import DoctorDashboard from "@/pages/doctor-dashboard";
import MarketerLogin from "@/pages/marketer-login";
import MarketerDashboard from "@/pages/marketer-dashboard";
import Broadcast from "@/pages/Broadcast";
import NotFound from "@/pages/not-found";

// Join page component that redirects to signup
function JoinPage() {
  return <AppLogin defaultTab="signup" />;
}

// Session tracking component
function SessionTracker() {
  useSessionTracking();
  return null;
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => <Layout><Dashboard /><SessionTracker /></Layout>} />
      <Route path="/doctors" component={() => <Layout><Doctors /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/tracking" component={() => <Layout><Tracking /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/fitness" component={() => <Layout><Fitness /><SessionTracker /></Layout>} />
      <Route path="/trainer/profile" component={() => <><TrainerProfile /><SessionTracker /></>} />
      <ProtectedRoute path="/subscribe" component={() => <Layout><Subscribe /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/elder-care" component={() => <Layout><ElderCare /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/pulse" component={() => <><Pulse /><SessionTracker /></>} />
      <ProtectedRoute path="/ai-doc" component={() => <Layout><AIDoc /><SessionTracker /></Layout>} />
      <Route path="/ai" component={() => <Layout><AI /><SessionTracker /></Layout>} />
      <Route path="/signup" component={() => <><SimpleSignup /><SessionTracker /></>} />
      <ProtectedRoute path="/chat-history" component={() => <Layout><ChatHistory /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/profile" component={() => <Layout><Profile /><SessionTracker /></Layout>} />
      <ProtectedRoute path="/settings" component={() => <Layout><Settings /><SessionTracker /></Layout>} />
      <Route path="/about" component={() => <><About /><SessionTracker /></>} />
      <Route path="/team" component={() => <><Team /><SessionTracker /></>} />
      <Route path="/market" component={() => <><Market /><SessionTracker /></>} />
      <Route path="/book" component={() => <><BookPage /><SessionTracker /></>} />
      <Route path="/prescriptions-form" component={() => <><PrescriptionsForm /><SessionTracker /></>} />
      <Route path="/food" component={() => <><FoodFeed /><SessionTracker /></>} />
      <ProtectedRoute path="/health-tips-subscription" component={() => <><HealthTipsSubscription /><SessionTracker /></>} />
      <Route path="/broadcast" component={() => <><Broadcast /><SessionTracker /></>} />
     
      <Route path="/auth" component={() => <AppLogin />} />
      <Route path="/app-login" component={() => <AppLogin />} />
      <Route path="/login" component={() => <AppLogin />} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/join" component={JoinPage} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/case-manager" component={CaseManagerLogin} />
      <Route path="/case-manager/dashboard" component={CaseManagerDashboard} />
      <Route path="/customer-service" component={CustomerServiceLogin} />
      <Route path="/customer-service/dashboard" component={CustomerServiceDashboard} />
      <Route path="/presibo-manager" component={PresiboManagerLogin} />
      <Route path="/presibo-manager/dashboard" component={PresiboManagerDashboard} />
      <Route path="/doctor-login" component={DoctorLogin} />
      <Route path="/doctor-reset-password" component={DoctorResetPassword} />
      <Route path="/doctor-dashboard" component={DoctorDashboard} />
      <Route path="/marketer-login" component={MarketerLogin} />
      <Route path="/marketer-dashboard" component={MarketerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
