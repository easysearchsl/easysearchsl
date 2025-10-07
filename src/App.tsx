import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { RequireAuth } from "@/components/routing/RequireAuth";
import PreloaderOverlay from "@/components/shared/PreloaderOverlay";
import { AppLayout } from "./components/layout/AppLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { CreateListing } from "./pages/CreateListing";
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
import Announcements from "./pages/Announcements";
import NewsBlog from "./pages/NewsBlog";
import Products from "./pages/Products";
import SavedListings from "./pages/SavedListings";
import MyLikes from "./pages/MyLikes";
import SubmitReview from "./pages/SubmitReview";
import ManageListings from "./pages/ManageListings";
import Polls from "./pages/Polls";
import SurveyBuilder from "./pages/SurveyBuilder";
import SurveyResponse from "./pages/SurveyResponse";
import Surveys from "./pages/Surveys";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import { getAnnouncements, addAnnouncement, updateAnnouncement, type Announcement as StoreAnnouncement } from "@/lib/announcements-store";
import { generateAnnouncementImage } from "@/lib/image-utils";
import { getProducts as getProductsStore, addProduct as addProductStore, type Product as StoreProduct } from "@/lib/products-store";
import NotificationsPage from "./pages/Notifications";
import AdminNotifications from "./pages/admin/Notifications";
import { getAllNotifications as getAllNotifs, addNotification as addNotif, type NotificationItem as StoreNotification } from "@/lib/notifications-store";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminOrganizations from "./pages/admin/Organizations";
import AdminListings from "./pages/admin/Listings";
import AdminProducts from "./pages/admin/Products";
import AdminReviews from "./pages/admin/Reviews";
import AdminSettings from "./pages/admin/Settings";
import AdminLogs from "./pages/admin/Logs";
import UserSettings from "./pages/Settings";
import EnvDiagnostics from "./pages/EnvDiagnostics";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  // Removed mock announcements seeding (now using Supabase data throughout)

  // One-time mock notifications seeding (role-based, org-targeted, and broadcast)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const seededKey = "easysearch.notifications.seeded";
      const alreadySeeded = localStorage.getItem(seededKey);
      const existing = getAllNotifs();
      if (alreadySeeded || (existing && existing.length > 0)) return;

      const now = Date.now();
      const samples: StoreNotification[] = [
        {
          id: "seed-notif-all-1",
          title: "Welcome to EasySearch SL",
          message: "Thanks for joining! Explore listings and features across the platform.",
          createdAt: new Date(now - 60_000).toISOString(),
          type: "system",
          audience: { all: true },
          highlight: false,
        },
        {
          id: "seed-notif-registered-1",
          title: "Saved Listings Update",
          message: "One of your saved listings has new updates.",
          createdAt: new Date(now - 30_000).toISOString(),
          type: "listing",
          link: "/saved",
          audience: { roles: ["registered"] },
          highlight: false,
        },
        {
          id: "seed-notif-business-1",
          title: "Listing Approved",
          message: "Your listing has been approved and is now live.",
          createdAt: new Date(now - 20_000).toISOString(),
          type: "listing",
          link: "/manage-listings",
          audience: { roles: ["business"], orgIds: ["org1"] },
          highlight: false,
        },
        {
          id: "seed-notif-business-2",
          title: "New Customer Message",
          message: "You received a new message from a customer.",
          createdAt: new Date(now - 10_000).toISOString(),
          type: "message",
          link: "/inbox",
          audience: { roles: ["business"], orgIds: ["org1"] },
          highlight: false,
        },
        {
          id: "seed-notif-admin-1",
          title: "System Health: All Clear",
          message: "Monitoring reports no incidents in the last 24 hours.",
          createdAt: new Date(now - 5_000).toISOString(),
          type: "system",
          link: "/admin/logs",
          audience: { roles: ["superadmin"] },
          highlight: false,
        },
        {
          id: "seed-notif-broadcast-1",
          title: "Platform Maintenance Tonight",
          message: "We will perform scheduled maintenance at 10 PM GMT. Some features may be unavailable.",
          createdAt: new Date(now).toISOString(),
          type: "announcement",
          link: "/announcements",
          audience: { all: true },
          highlight: true,
          createdBy: "superadmin",
        },
      ];
      samples.forEach((n) => addNotif(n));
      localStorage.setItem(seededKey, "1");
    } catch {
      // ignore
    }
  }, []);

  // Removed mock products seeding (products managed per-listing via UI)

  // Global loading overlay controls
  const LocationWatcher: React.FC = () => {
    const location = useLocation();
    const isFetching = useIsFetching();
    const [routeLoading, setRouteLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    // Mark a short route transition window on path/search change
    useEffect(() => {
      setRouteLoading(true);
      const t = window.setTimeout(() => setRouteLoading(false), 400);
      return () => window.clearTimeout(t);
    }, [location.pathname, location.search]);

    // Anti-flicker: only show if loading lasts beyond 120ms; keep for at least 200ms
    useEffect(() => {
      let showTimer: number | undefined;
      let hideTimer: number | undefined;
      const active = routeLoading || isFetching > 0;
      if (active) {
        showTimer = window.setTimeout(() => setVisible(true), 120);
      } else {
        // keep visible a bit to avoid flash
        hideTimer = window.setTimeout(() => setVisible(false), 200);
      }
      return () => {
        if (showTimer) window.clearTimeout(showTimer);
        if (hideTimer) window.clearTimeout(hideTimer);
      };
    }, [routeLoading, isFetching]);

    return <PreloaderOverlay active={visible} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LocationWatcher />
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/listings" element={<Browse />} />
                  <Route path="/listings/:slug" element={<ListingView />} />
                  <Route path="/browse" element={<Navigate to="/listings" replace />} />
                  <Route path="/featured" element={<Featured />} />
                  <Route path="/pricing" element={<PricingPlans />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/env" element={<EnvDiagnostics />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/surveys" element={<Surveys />} />
                  <Route path="/surveys/:id" element={<SurveyResponse />} />
                </Route>
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <AppLayout><Dashboard /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/manage-listings"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><ManageListings /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <RequireAuth>
                      <AppLayout><SavedListings /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/likes"
                  element={
                    <RequireAuth>
                      <AppLayout><MyLikes /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/reviews/submit"
                  element={
                    <RequireAuth>
                      <AppLayout><SubmitReview /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route path="/announcements" element={<AppLayout><Announcements /></AppLayout>} />
                <Route path="/news-blog" element={<AppLayout><NewsBlog /></AppLayout>} />
                <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
                <Route
                  path="/listings/create"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><CreateListing /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><Team /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><Analytics /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/polls"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><Polls /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/surveys/new"
                  element={
                    <RequireAuth allowedRoles={["business", "superadmin"]}>
                      <AppLayout><SurveyBuilder /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <RequireAuth>
                      <AppLayout><Subscription /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RequireAuth>
                      <AppLayout><NotificationsPage /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <AppLayout><UserSettings /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    <RequireAuth>
                      <AppLayout><Inbox /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
                <Route path="/coupons" element={<AppLayout><Coupons /></AppLayout>} />
                <Route path="/search" element={<AppLayout><AdvancedSearch /></AppLayout>} />
                {/* Super Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminDashboard /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminUsers /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/organizations"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminOrganizations /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/listings"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminListings /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminProducts /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminReviews /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminSettings /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminLogs /></AppLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <RequireAuth allowedRoles={["superadmin"]}>
                      <AppLayout><AdminNotifications /></AppLayout>
                    </RequireAuth>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
