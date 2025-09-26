import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types';
import { categoryTree } from '@/data/categories';

export type ListingsQueryParams = {
  query?: string;
  category?: string;
  province?: string;
  district?: string;
  chiefdom?: string;
  sortBy?: 'rating' | 'reviews' | 'name' | 'newest';
  page?: number;
  perPage?: number;
  status?: 'draft' | 'published' | 'archived';
};

export type ListingsQueryResult = {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  fromSupabase: boolean;
};

const defaultHours = {
  monday: { closed: true },
  tuesday: { closed: true },
  wednesday: { closed: true },
  thursday: { closed: true },
  friday: { closed: true },
  saturday: { closed: true },
  sunday: { closed: true },
};

const normalizeListing = (raw: any): Listing => {
  return {
    id: raw.id,
    organization_id: raw.organization_id || raw.org_id || 'org1',
    slug: raw.slug,

    title: raw.title || raw.name || 'Untitled',
    tagline: raw.tagline || '',
    description: raw.description || '',
    category: raw.category || 'General',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    location: raw.location || {
      province: raw.province || '',
      district: raw.district || '',
      chiefdom: raw.chiefdom || '',
    },
    full_address: raw.full_address || '',
    business_hours:
      typeof raw.business_hours === 'string'
        ? JSON.parse(raw.business_hours)
        : raw.business_hours || (defaultHours as any),

    price_range: raw.price_range,

    logo_url: raw.logo_url || raw.logo || raw.logoUrl || undefined,
    images: Array.isArray(raw.images) ? raw.images : [],
    videos: Array.isArray(raw.videos) ? raw.videos : [],

    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    announcements: Array.isArray(raw.announcements) ? raw.announcements : [],
    deals: Array.isArray(raw.deals) ? raw.deals : [],
    menu: Array.isArray(raw.menu) ? raw.menu : [],
    events: Array.isArray(raw.events) ? raw.events : [],

    contact_email: raw.contact_email || undefined,
    contact_phone: raw.contact_phone || undefined,
    whatsapp_number: raw.whatsapp_number || undefined,
    website_url: raw.website_url || undefined,
    contact_person: raw.contact_person || undefined,
    team_members: Array.isArray(raw.team_members) ? raw.team_members : undefined,
    target_audience: Array.isArray(raw.target_audience) ? raw.target_audience : undefined,
    social_links: raw.social_links || {},

    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    review_count: typeof raw.review_count === 'number' ? raw.review_count : 0,
    view_count: raw.view_count || 0,
    likes_count: raw.likes_count || 0,
    booking_enabled: !!raw.booking_enabled,

    status: raw.status || 'published',
    featured_until: raw.featured_until || undefined,
    legal_status: raw.legal_status || undefined,
    year_registered: raw.year_registered || undefined,
    verified: !!raw.verified,
    vision_statement: raw.vision_statement || undefined,
    mission_statement: raw.mission_statement || undefined,

    // legacy
    district: raw.district || undefined,
    chiefdom: raw.chiefdom || undefined,

    created_by: raw.created_by || 'system',
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
};

const normalizeName = (s?: string) => (s || '')
  .toLowerCase()
  .replace(/\s+district$/i, '')
  .replace(/\s+region$/i, '')
  .trim();

const findCategoryLabelByValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const stack: any[] = [...categoryTree];
  while (stack.length) {
    const node = stack.pop();
    if (node.value === value) return node.label;
    if (node.children) stack.push(...node.children);
  }
  return undefined;
};

const sortListings = (arr: Listing[], sortBy?: 'rating' | 'reviews' | 'name' | 'newest') => {
  const copy = [...arr];
  switch (sortBy) {
    case 'rating':
      return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'reviews':
      return copy.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    case 'name':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    default:
      return copy;
  }
};

export async function searchListings(params: ListingsQueryParams): Promise<ListingsQueryResult> {
  const {
    query,
    category,
    province,
    district,
    chiefdom,
    sortBy = 'rating',
    page = 1,
    perPage = 12,
    status = 'published',
  } = params;

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    let q = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', status);

    if (category && category !== 'all') {
      const label = findCategoryLabelByValue(category);
      const escCategory = category.replace(/%/g, '\\%').replace(/_/g, '\\_');
      const escLabel = (label || '').replace(/%/g, '\\%').replace(/_/g, '\\_');
      if (label) {
        q = q.or(`category.eq.${escCategory},category.ilike.%${escLabel}%`);
      } else {
        q = q.eq('category', category);
      }
    }

    if (query && query.trim()) {
      const esc = query.replace(/%/g, '\\%').replace(/_/g, '\\_');
      q = q.or(`title.ilike.%${esc}%,description.ilike.%${esc}%`);
    }

    // Location filtering: try JSON location + legacy columns via OR
    const orFilters: string[] = [];
    if (province && province.trim() && province !== 'all') {
      const pv = normalizeName(province);
      orFilters.push(`province.ilike.%${pv}%`);
      orFilters.push(`location->>province.ilike.%${pv}%`);
    }
    if (district && district.trim() && district !== 'all') {
      const dv = normalizeName(district);
      orFilters.push(`district.ilike.%${dv}%`);
      orFilters.push(`location->>district.ilike.%${dv}%`);
    }
    if (chiefdom && chiefdom.trim()) {
      const cv = normalizeName(chiefdom);
      orFilters.push(`chiefdom.ilike.%${cv}%`);
      orFilters.push(`location->>chiefdom.ilike.%${cv}%`);
    }
    if (orFilters.length > 0) {
      q = q.or(orFilters.join(','));
    }

    // Sorting
    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      rating: { column: 'rating', ascending: false },
      reviews: { column: 'review_count', ascending: false },
      name: { column: 'title', ascending: true },
      newest: { column: 'created_at', ascending: false },
    };
    const s = sortMap[sortBy] || sortMap['rating'];
    q = q.order(s.column as any, { ascending: s.ascending });

    const { data, error, count } = await q.range(from, to);

    if (error) throw error;

    const listings = (data || []).map(normalizeListing);
    const total = count ?? listings.length;

    return { listings, total, page, per_page: perPage, fromSupabase: true };
  } catch (_) {
    // On error, return empty result from Supabase source
    return { listings: [], total: 0, page, per_page: perPage, fromSupabase: true };
  }
}

export async function getFeaturedListings(limit = 5): Promise<{ listings: Listing[]; fromSupabase: boolean }> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'published')
      .gt('featured_until', now)
      .order('featured_until', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { listings: (data || []).map(normalizeListing), fromSupabase: true };
  } catch (_) {
    return { listings: [], fromSupabase: true };
  }
}
