export type NewsPost = {
  id: string;
  listingId: string;
  listingTitle: string;
  title: string;
  content: string;
  tags?: string[];
  coverImageDataUrl?: string;
  status: "draft" | "published";
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  // Multi-listing support (primary kept for backward compatibility)
  listingIds?: string[];
  listingTitles?: string[];
  // Analytics
  viewCount?: number;
  clickCount?: number;
  // Optional publish date/time when status becomes published
  publishedAt?: string; // ISO
  // Optional gallery support
  imageGalleryDataUrls?: string[];
};

const STORAGE_KEY = "easysearch.news";

function load(): NewsPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NewsPost[];
  } catch {
    return [];
  }
}

function save(data: NewsPost[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNewsPosts(): NewsPost[] {
  return load();
}

export function addNewsPost(p: NewsPost) {
  const items = load();
  items.unshift(p);
  save(items);
}

export function updateNewsPost(updated: NewsPost) {
  const items = load();
  const idx = items.findIndex((x) => x.id === updated.id);
  if (idx === -1) return;
  items[idx] = { ...updated, updatedAt: new Date().toISOString() };
  save(items);
}

export function deleteNewsPost(id: string) {
  const items = load().filter((x) => x.id !== id);
  save(items);
}

export function clearNewsPosts() {
  save([]);
}

// Analytics helpers
export function incrementNewsView(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const curr = items[idx];
  const viewCount = (curr.viewCount || 0) + 1;
  items[idx] = { ...curr, viewCount };
  save(items);
}

export function incrementNewsClick(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const curr = items[idx];
  const clickCount = (curr.clickCount || 0) + 1;
  items[idx] = { ...curr, clickCount };
  save(items);
}
