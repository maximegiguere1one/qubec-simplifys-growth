
import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useNavigationSetup } from "@/lib/navigation";
import { useWebVitals } from "@/hooks/useWebVitals";
import { CalEmbedProvider } from "@/lib/cal";


// Route-level code splitting for better performance - ALL pages lazy loaded now
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Quiz = lazy(() => import("./pages/Quiz"));
const VSL = lazy(() => import("./pages/VSL")); // Now properly lazy-loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Agents = lazy(() => import("./pages/Agents"));
const EmailSettings = lazy(() => import("./pages/EmailSettings"));
const EmailDiagnostic = lazy(() => import("./pages/EmailDiagnostic"));
const EmailAnalytics = lazy(() => import("./pages/EmailAnalytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const navigate = useNavigate();
  useNavigationSetup(navigate);
  useWebVitals(); // Track Core Web Vitals
  
  return (
    <>
      <Toaster />
      <Sonner />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vsl" element={<VSL />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/email-settings" element={<EmailSettings />} />
          <Route path="/email-diagnostic" element={<EmailDiagnostic />} />
          <Route path="/email-analytics" element={<EmailAnalytics />} />
          <Route path="/index" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <CalEmbedProvider>
          <AppContent />
        </CalEmbedProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
