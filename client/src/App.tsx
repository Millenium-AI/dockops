import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Board from "@/pages/Board";
import Schedule from "@/pages/Schedule";
import Reporting from "@/pages/Reporting";

function useHashLocationNoQuery(): [string, (to: string) => void] {
  const [hashLoc, navigate] = useHashLocation();
  const path = hashLoc.split("?")[0] || "/";
  return [path, navigate];
}

function AppRouter() {
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocationNoQuery}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
