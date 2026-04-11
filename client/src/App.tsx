import { Router } from "wouter";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

function RouterRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Router base="/Thyroid-CoachFredericNIDDAM">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <RouterRoutes />
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
