import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  Building,
  Search,
  Star,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package,
  ListChecks,
  Bookmark,
  PenSquare,
  TrendingUp,
  Home,
  Info,
  Phone,
  Settings,
  ScrollText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRole } from "@/hooks/useRole";
import { fetchMenu } from "@/lib/navigation";

type Item = { label: string; path: string };

const iconFor = (label: string) => {
  const map: Record<string, any> = {
    Dashboard: LayoutDashboard,
    Listings: FileText,
    "Manage Listings": ListChecks,
    "Saved Listings": Bookmark,
    "Submit Review": PenSquare,
    Announcements: Megaphone,
    "News & Blog": Newspaper,
    "Products": Package,
    "Products & Services": Package,
    "Manage Polls": TrendingUp,
    "Manage Polls & Surveys": TrendingUp,
    "Polls & Surveys": TrendingUp,
    Messages: MessageSquare,
    Team: Users,
    Analytics: BarChart3,
    Subscription: CreditCard,
    "Profile / Settings": Settings,
    Home: Home,
    "About Us": Info,
    "Contact Us": Phone,
    Pricing: CreditCard,
    "Browse Directory": Search,
    "Featured Listings": Star,
    // Super Admin
    "Super Admin": LayoutDashboard,
    "Users Management": Users,
    "Organizations Management": Building,
    "Listings Management": ListChecks,
    "Products & Services Management": Package,
    "Reviews & Feedback Management": Star,
    "Platform Settings": Settings,
    "System Logs / Audit Trail": ScrollText,
  };
  return map[label] || FileText;
};

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { role, loading } = useRole();
  const [items, setItems] = useState<Item[]>([]);

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = (active: boolean) =>
    active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  const handleNavClick = () => {
    // Auto-close on mobile after navigating
    if (isMobile) setOpenMobile(false);
  };

  useEffect(() => {
    let mounted = true;
    fetchMenu(role).then((res) => {
      if (mounted) setItems(res);
    });
    return () => {
      mounted = false;
    };
  }, [role]);

  const groupLabel = useMemo(() => {
    if (role === "superadmin") return "Super Admin";
    if (role === "business") return "Business Portal";
    if (role === "guest") return "User Portal";
    return "Public";
  }, [role]);

  return (
    // Add a top offset and adjusted height on desktop so the fixed sidebar sits below the sticky header (h-16)
    <Sidebar className={(collapsed ? "w-14" : "w-64") + " md:top-16 md:h-[calc(100svh-4rem)]"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {!collapsed && groupLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(loading ? [] : items).map((item) => {
                const Icon = iconFor(item.label);
                return (
                  <SidebarMenuItem key={`${item.label}-${item.path}`}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        className={({ isActive: navActive }) =>
                          getNavClass(
                            navActive || (currentPath.startsWith(item.path) && item.path !== "/")
                          )
                        }
                        onClick={handleNavClick}
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}