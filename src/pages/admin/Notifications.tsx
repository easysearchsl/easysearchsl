import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { addNotification, getAllNotifications, type NotificationItem } from "@/lib/notifications-store";
import type { AuthRole } from "@/contexts/AuthContext";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sendAll, setSendAll] = useState(true);
  const [roles, setRoles] = useState<{registered: boolean; business: boolean; superadmin: boolean}>({ registered: false, business: false, superadmin: false });
  const [orgIds, setOrgIds] = useState("");
  const [userIds, setUserIds] = useState("");
  const [highlight, setHighlight] = useState(true);

  const existing = useMemo(() => getAllNotifications().slice(0, 20), []);

  const onSend = () => {
    const id = `admin-${Date.now()}`;
    const roleTargets: Exclude<AuthRole, "guest">[] = [];
    if (roles.registered) roleTargets.push("registered");
    if (roles.business) roleTargets.push("business");
    if (roles.superadmin) roleTargets.push("superadmin");
    const audience: NotificationItem["audience"] = sendAll
      ? { all: true }
      : {
          roles: roleTargets,
          orgIds: orgIds.trim() ? orgIds.split(",").map((s) => s.trim()) : undefined,
          userIds: userIds.trim() ? userIds.split(",").map((s) => s.trim()) : undefined,
        };
    const notif: NotificationItem = {
      id,
      title: title || "Announcement",
      message: message || "",
      createdAt: new Date().toISOString(),
      type: "announcement",
      link: link || undefined,
      highlight,
      createdBy: "superadmin",
      audience,
      readBy: {},
    };
    addNotification(notif);
    setTitle("");
    setMessage("");
    setLink("");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Broadcast Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Maintenance tonight" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Optional Link</Label>
              <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/announcements" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="We will perform scheduled maintenance at 10 PM..." />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Audience</Label>
              <div className="flex items-center gap-2">
                <Checkbox id="all" checked={sendAll} onCheckedChange={(v) => setSendAll(!!v)} />
                <Label htmlFor="all">All users</Label>
              </div>

              {!sendAll && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="r" checked={roles.registered} onCheckedChange={(v) => setRoles((s) => ({ ...s, registered: !!v }))} />
                    <Label htmlFor="r">Registered Users</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="b" checked={roles.business} onCheckedChange={(v) => setRoles((s) => ({ ...s, business: !!v }))} />
                    <Label htmlFor="b">Business Owners</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sa" checked={roles.superadmin} onCheckedChange={(v) => setRoles((s) => ({ ...s, superadmin: !!v }))} />
                    <Label htmlFor="sa">Admins</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgs">Org IDs (comma separated)</Label>
                    <Input id="orgs" placeholder="org1, org2" value={orgIds} onChange={(e) => setOrgIds(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="users">User IDs (comma separated)</Label>
                    <Input id="users" placeholder="user1, user2" value={userIds} onChange={(e) => setUserIds(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="hl" checked={highlight} onCheckedChange={(v) => setHighlight(!!v)} />
                <Label htmlFor="hl">Highlight as Announcement</Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Preview</Label>
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">{title || 'Announcement'} {highlight && <Badge variant="secondary">Announcement</Badge>}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{message || 'Your announcement message...'}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onSend}>Send Notification</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {existing.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            existing.map((n) => (
              <div key={n.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium flex items-center gap-2">{n.title} {n.highlight && <Badge variant="secondary">Announcement</Badge>}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{n.message}</div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
