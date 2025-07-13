import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/listings" element={<AppLayout><div>Listings Page</div></AppLayout>} />
          <Route path="/team" element={<AppLayout><div>Team Page</div></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><div>Analytics Page</div></AppLayout>} />
          <Route path="/subscription" element={<AppLayout><div>Subscription Page</div></AppLayout>} />
          <Route path="/browse" element={<AppLayout><div>Browse Directory</div></AppLayout>} />
          <Route path="/featured" element={<AppLayout><div>Featured Listings</div></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
