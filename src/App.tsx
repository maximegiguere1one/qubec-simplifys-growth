import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PixelManager } from "@/components/PixelManager";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Quiz from "./pages/Quiz";
import VSL from "./pages/VSL";
import BookCall from "./pages/BookCall";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PixelManager>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/vsl" element={<VSL />} />
            <Route path="/book-call" element={<BookCall />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/index" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PixelManager>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
