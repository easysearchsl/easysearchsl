import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotificationsForUser,
  getUnreadCount,
  markNotificationRead,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notifications-store";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // subscribe for updates
    const unsub = subscribeNotifications(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const unread = useMemo(() => getUnreadCount(user), [tick, user]);
  const latest = useMemo(() => {
    const list = getNotificationsForUser(user);
    // sort unread first, then by createdAt desc
    const sorted = [...list].sort((a, b) => {
      const ar = a.readBy?.[user?.id || ""] ? 1 : 0;
      const br = b.readBy?.[user?.id || ""] ? 1 : 0;
      if (ar !== br) return ar - br; // unread first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, 5);
  }, [tick, user]);

  const onOpenItem = (n: NotificationItem) => {
    if (!user) return;
    markNotificationRead(n.id, user.id);
    if (n.link) navigate(n.link);
    else navigate("/notifications");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hover:bg-secondary/10 hover:text-secondary">
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-[16px] px-1 leading-none">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <Bell className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-medium">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {latest.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">No notifications</div>
        ) : (
          latest.map((n) => (
            <DropdownMenuItem key={n.id} className="gap-2" onSelect={() => onOpenItem(n)}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${n.readBy?.[user.id] ? 'bg-muted' : 'bg-primary'}`} />
                  <span className="text-sm font-medium">{n.title}</span>
                  {n.highlight && <Badge variant="secondary" className="ml-1">Announcement</Badge>}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/notifications')}>View all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
