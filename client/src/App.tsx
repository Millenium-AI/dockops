import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Projects from "@/pages/Projects";
import Permits from "@/pages/Permits";
import Schedule from "@/pages/Schedule";
import Customers from "@/pages/Customers";
import Finance from "@/pages/Finance";

// Wraps wouter's hash hook to strip query strings so route matching for
// `/projects?p=P-1036` still resolves to `/projects`. Pages read query
// params independently from window.location.hash via useEffect.
function useHashLocationNoQuery(): [string, (to: string) => void] {
  const [hashLoc, navigate] = useHashLocation();
  const path = hashLoc.split("?")[0] || "/";
  return [path, navigate];
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sales" component={Sales} />
      <Route path="/projects" component={Projects} />
      <Route path="/permits" component={Permits} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/customers" component={Customers} />
      <Route path="/finance" component={Finance} />
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
