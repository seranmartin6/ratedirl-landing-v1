import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import SearchPage from "@/pages/search";
import ProfilePage from "@/pages/profile";
import WriteReview from "@/pages/write-review";
import Nominate from "@/pages/nominate";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";
import AdminModeration from "@/pages/admin";
import InvitePage from "@/pages/invite";
import Feed from "@/pages/feed";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/invite/:token" component={InvitePage} />
      
      {/* Protected routes */}
      <Route path="/app">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/feed">
        <ProtectedRoute component={Feed} />
      </Route>
      <Route path="/people" >
        <ProtectedRoute component={SearchPage} />
      </Route>
      <Route path="/people/:id">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route path="/write-review/:id">
        <ProtectedRoute component={WriteReview} />
      </Route>
      <Route path="/nominate">
        <ProtectedRoute component={Nominate} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/admin/moderation">
        <ProtectedRoute component={AdminModeration} />
      </Route>
      
      {/* Fallback */}
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
