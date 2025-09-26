import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, Bookmark, MessageSquare, CreditCard, ListChecks, TrendingUp } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Link, useNavigate } from "react-router-dom";
import { PublicTopNav } from "./PublicTopNav";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentOrg } = useTenant();
  const dashboardPath = user?.role === "superadmin" ? "/admin" : "/dashboard";

  return (
    <header className="h-16 sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-primary">{currentOrg?.name || "Select a tenant"}</h2>
            <p className="text-sm text-muted-foreground">Business Directory</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex md:justify-center">
        <PublicTopNav />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback>
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate(dashboardPath)}>
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
              <DropdownMenuItem onSelect={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}