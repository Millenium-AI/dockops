import { useEffect, useState } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

import Board from "@/pages/Board";
import Schedule from "@/pages/Schedule";
import Reporting from "@/pages/Reporting";

function useHashLocationNoQuery(): [string, (to: string) => void] {
  const [hashLoc, navigate] = useHashLocation();
  const path = hashLoc.split("?")[0] || "/";
  return [path, navigate];
}

function AppRouter({ isAuthenticated, isLoading }: { isAuthenticated: boolean; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Board} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/reporting" component={Reporting} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        setIsAuthenticated(res.ok);
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
          <AppRouter isAuthenticated={isAuthenticated} isLoading={isLoading} />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
