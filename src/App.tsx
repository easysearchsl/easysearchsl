import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { Listings } from "./pages/Listings";
import { Team } from "./pages/Team";
import { Analytics } from "./pages/Analytics";
import { Subscription } from "./pages/Subscription";
import { Browse } from "./pages/Browse";
import Featured from "./pages/Featured";
import ListingView from "./pages/ListingView";
import NotFound from "./pages/NotFound";
import PublicSubmit from "./pages/PublicSubmit";
import PricingPlans from "./pages/PricingPlans";
import Inbox from "./pages/Inbox";
import Events from "./pages/Events";
import Coupons from "./pages/Coupons";
import AdvancedSearch from "./pages/AdvancedSearch";

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
          <Route path="/listings" element={<AppLayout><Listings /></AppLayout>} />
          <Route path="/team" element={<AppLayout><Team /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
          <Route path="/browse" element={<AppLayout><Browse /></AppLayout>} />
          <Route path="/featured" element={<AppLayout><Featured /></AppLayout>} />
          <Route path="/listings/:slug" element={<AppLayout><ListingView /></AppLayout>} />
          <Route path="/submit" element={<PublicSubmit />} />
          <Route path="/pricing" element={<PricingPlans />} />
          <Route path="/inbox" element={<AppLayout><Inbox /></AppLayout>} />
          <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
          <Route path="/coupons" element={<AppLayout><Coupons /></AppLayout>} />
          <Route path="/search" element={<AppLayout><AdvancedSearch /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
