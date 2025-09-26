export type Announcement = {
  id: string;
  listingId: string;
  listingTitle: string;
  // New multi-listing support (backwards compatible with listingId/listingTitle)
  listingIds?: string[];
  listingTitles?: string[];
  ctaType: string;
  iconClass?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  status: "draft" | "published"; // publish state
  imageDataUrl?: string; // single image (base64 data URL)
  // Basic analytics
  viewCount?: number;
  clickCount?: number;
  // Optional expiration date (ISO date string: YYYY-MM-DD)
  expiresAt?: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

const STORAGE_KEY = "easysearch.announcements";

function load(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Announcement[];
  } catch {
    return [];
  }
}

function save(data: Announcement[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAnnouncements(): Announcement[] {
  return load();
}

export function addAnnouncement(a: Announcement) {
  const items = load();
  items.unshift(a);
  save(items);
}

export function deleteAnnouncement(id: string) {
  const items = load().filter((x) => x.id !== id);
  save(items);
}

export function clearAnnouncements() {
  save([]);
}

export function updateAnnouncement(updated: Announcement) {
  const items = load();
  const idx = items.findIndex((x) => x.id === updated.id);
  if (idx === -1) return; // no-op if not found
  items[idx] = { ...updated, updatedAt: new Date().toISOString() };
  save(items);
}

export function incrementAnnouncementView(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return; // ignore mock/fallback or missing
  const item = items[idx];
  const next: Announcement = {
    ...item,
    viewCount: (item.viewCount ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  save(items);
}

export function incrementAnnouncementClick(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return; // ignore mock/fallback or missing
  const item = items[idx];
  const next: Announcement = {
    ...item,
    clickCount: (item.clickCount ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  save(items);
}
