import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicTopNav } from "./PublicTopNav";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, Bookmark, MessageSquare, CreditCard, ListChecks, TrendingUp } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

export function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const isLogin = location.pathname.startsWith("/login");
  const isRegister = location.pathname.startsWith("/register");
  const dashboardPath = user?.role === "superadmin" ? "/admin" : "/dashboard";
  const onDashboard = location.pathname === dashboardPath || location.pathname.startsWith(`${dashboardPath}/`);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2" aria-label="Go to home">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            <span className="font-semibold text-foreground">EasySearch</span>
          </Link>
        </div>

        <div className="flex-1 flex md:justify-center">
          <PublicTopNav />
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button asChild variant={isRegister ? "default" : "ghost"} size="sm">
                <Link to="/login" aria-current={isLogin ? "page" : undefined}>Sign in</Link>
              </Button>
              <Button asChild variant={isLogin ? "default" : "secondary"} size="sm">
                <Link to="/register" aria-current={isRegister ? "page" : undefined}>Register</Link>
              </Button>
            </>
          ) : (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url} alt={user?.full_name || "User"} />
                      <AvatarFallback>{(user?.full_name || "U").split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate(dashboardPath)} aria-current={onDashboard ? "page" : undefined}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {(user?.role === 'business' || user?.role === 'superadmin') && (
                    <>
                      <DropdownMenuItem onSelect={() => navigate('/manage-listings')}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        Manage Listings
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('/polls')}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Polls & Surveys
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onSelect={() => navigate('/saved')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Listings
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/inbox')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2" aria-label="Go to home">
              <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
              <span className="font-semibold text-foreground">EasySearch</span>
            </Link>
            <p className="mt-3 text-sm text-foreground/70 max-w-sm">
              Discover and connect with businesses, products, and services across Sierra Leone.
            </p>
          </div>
          <nav aria-label="Quick links" className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/" className="text-foreground/80 hover:text-primary">Home</Link>
            <Link to="/listings" className="text-foreground/80 hover:text-primary">Listings</Link>
            <Link to="/about" className="text-foreground/80 hover:text-primary">About Us</Link>
            <Link to="/contact" className="text-foreground/80 hover:text-primary">Contact Us</Link>
            <Link to="/pricing" className="text-foreground/80 hover:text-primary">Pricing</Link>
          </nav>
          <div className="flex md:justify-end items-start gap-3">
            <a href="#" aria-label="Facebook" className="text-foreground/70 hover:text-primary"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="text-foreground/70 hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="text-foreground/70 hover:text-primary"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} EasySearch SL. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
