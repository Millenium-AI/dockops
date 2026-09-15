import { useEffect, useState } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Admin from "@/pages/Admin";

import Board from "@/pages/Board";
import Schedule from "@/pages/Schedule";
import Reporting from "@/pages/Reporting";

function useHashLocationNoQuery(): [string, (to: string) => void] {
  const [hashLoc, navigate] = useHashLocation();
  const path = hashLoc.split("?")[0] || "/";
  return [path, navigate];
}

function AppRouter({ isAuthenticated, isAdmin, isLoading }: { isAuthenticated: boolean; isAdmin: boolean; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Board} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/reporting" component={Reporting} />
      <Route path="/admin" component={isAdmin ? Admin : NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setIsAdmin(data.isAdmin || false);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocationNoQuery}>
          <AppRouter isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading} />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
