import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notifications-store";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Re-render on window focus and any notifications-store update
    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener('focus', onFocus);
    const unsub = subscribeNotifications(() => setTick((t) => t + 1));
    return () => { window.removeEventListener('focus', onFocus); unsub(); };
  }, []);

  // Ensure re-render when the logged-in user changes
  useEffect(() => {
    setTick((t) => t + 1);
  }, [user]);

  const list = useMemo(() => {
    const items = getNotificationsForUser(user);
    return [...items].sort((a, b) => {
      const ar = a.readBy?.[user?.id || ""] ? 1 : 0;
      const br = b.readBy?.[user?.id || ""] ? 1 : 0;
      if (ar !== br) return ar - br; // unread first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [user, tick]);

  const onOpen = (n: NotificationItem) => {
    if (!user) return;
    markNotificationRead(n.id, user.id);
    if (n.link) navigate(n.link);
  };

  const onMarkAll = () => {
    if (!user) return;
    markAllNotificationsRead(user.id);
    setTick((t) => t + 1);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <Button variant="secondary" onClick={onMarkAll} disabled={!user}>Mark all as read</Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="grid gap-3">
          {list.map((n) => {
            const isRead = !!n.readBy?.[user!.id];
            return (
              <Card key={n.id} className={`${!isRead ? 'border-primary/50' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {!isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    {n.title}
                    {n.highlight && <Badge variant="secondary">Announcement</Badge>}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                </CardHeader>
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <Button size="sm" variant="outline" onClick={() => { if (!user) return; markNotificationRead(n.id, user.id); setTick((t) => t + 1); }}>Mark as read</Button>
                    )}
                    {n.link && (
                      <Button size="sm" onClick={() => onOpen(n)}>Open</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
