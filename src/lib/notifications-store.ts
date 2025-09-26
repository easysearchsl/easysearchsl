// Simple localStorage-backed notifications store with per-user read tracking
// Audience-based filtering: all, roles, orgIds, userIds

import type { AuthUser, AuthRole } from "@/contexts/AuthContext";

export type NotificationType =
  | "system"
  | "message"
  | "listing"
  | "subscription"
  | "announcement";

export interface NotificationAudience {
  all?: boolean;
  roles?: Exclude<AuthRole, "guest">[]; // audiences exclude anonymous guest
  orgIds?: string[];
  userIds?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO
  type: NotificationType;
  link?: string;
  highlight?: boolean; // e.g., superadmin announcement
  createdBy?: string; // user id or role label
  audience: NotificationAudience;
  // Per-user read timestamps
  readBy?: Record<string, string | undefined>;
}

const LS_KEY = "easysearch.notifications";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveAll(list: NotificationItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  emit();
}

export function getAllNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<NotificationItem[]>(localStorage.getItem(LS_KEY), []);
}

export function addNotification(n: NotificationItem) {
  const all = getAllNotifications();
  const idx = all.findIndex((x) => x.id === n.id);
  if (idx >= 0) all[idx] = n; else all.unshift(n);
  saveAll(all);
}

export function updateNotification(id: string, patch: Partial<NotificationItem>) {
  const all = getAllNotifications();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  saveAll(all);
}

export function getNotificationsForUser(user: AuthUser | null): NotificationItem[] {
  const all = getAllNotifications();
  if (!user) return [];
  return all.filter((n) => matchesAudience(n, user));
}

export function getUnreadCount(user: AuthUser | null): number {
  if (!user) return 0;
  return getNotificationsForUser(user).filter((n) => !n.readBy?.[user.id]).length;
}

export function markNotificationRead(id: string, userId: string) {
  const all = getAllNotifications();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const now = new Date().toISOString();
  const readBy = { ...(all[idx].readBy || {}), [userId]: now };
  all[idx] = { ...all[idx], readBy };
  saveAll(all);
}

export function markAllNotificationsRead(userId: string) {
  const all = getAllNotifications().map((n) => ({
    ...n,
    readBy: { ...(n.readBy || {}), [userId]: n.readBy?.[userId] || new Date().toISOString() },
  }));
  saveAll(all);
}

function matchesAudience(n: NotificationItem, user: AuthUser): boolean {
  const aud = n.audience || {};
  if (aud.all) return true;
  if (aud.userIds && aud.userIds.includes(user.id)) return true;
  if (aud.roles && aud.roles.includes(user.role as Exclude<AuthRole, "guest">)) return true;
  if (aud.orgIds && user.memberships && user.memberships.some((m) => aud.orgIds!.includes(m.organization_id))) return true;
  return false;
}

// Simple subscribe/notify
export type NotificationsListener = () => void;
const listeners = new Set<NotificationsListener>();

export function subscribeNotifications(cb: NotificationsListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emit() {
  listeners.forEach((cb) => {
    try { cb(); } catch { /* ignore */ }
  });
}
