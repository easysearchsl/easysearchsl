export type Product = {
  id: string;
  listingId: string;
  listingTitle: string;
  // Optional arrays for multi-listing support (backward compatible)
  listingIds?: string[];
  listingTitles?: string[];
  name: string;
  // Distinguish between tangible products and services
  type: "product" | "service";
  description?: string;
  // Deprecated: Use priceMin/priceMax for ranges. Kept for backward compatibility with existing data.
  price?: number;
  priceMin?: number;
  priceMax?: number;
  currency?: string; // e.g., 'Le'
  imageDataUrl?: string;
  // Optional metadata similar to News/Announcements
  tags?: string[];
  // Optional call-to-action support
  buttonText?: string;
  buttonLink?: string;
  // Basic analytics
  viewCount?: number;
  clickCount?: number;
  // Optional publish date/time when status becomes published
  publishedAt?: string; // ISO
  // Optional gallery support
  imageGalleryDataUrls?: string[];
  status: "draft" | "published";
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

const STORAGE_KEY = "easysearch.products";

function load(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function save(data: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProducts(): Product[] {
  // Normalize legacy records without a type to default to 'product'
  return load().map((x: any) => ({
    ...x,
    type: (x && x.type) ? x.type : "product",
  })) as Product[];
}

export function addProduct(p: Product) {
  const items = load();
  items.unshift(p);
  save(items);
}

export function updateProduct(updated: Product) {
  const items = load();
  const idx = items.findIndex((x) => x.id === updated.id);
  if (idx === -1) return;
  items[idx] = { ...updated, updatedAt: new Date().toISOString() };
  save(items);
}

export function deleteProduct(id: string) {
  const items = load().filter((x) => x.id !== id);
  save(items);
}

export function clearProducts() {
  save([]);
}

// Analytics helpers
export function incrementProductView(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const curr = items[idx];
  const viewCount = (curr.viewCount || 0) + 1;
  items[idx] = { ...curr, viewCount, updatedAt: new Date().toISOString() };
  save(items);
}

export function incrementProductClick(id: string) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const curr = items[idx];
  const clickCount = (curr.clickCount || 0) + 1;
  items[idx] = { ...curr, clickCount, updatedAt: new Date().toISOString() };
  save(items);
}
