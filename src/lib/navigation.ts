export type NavRole = 'public' | 'business' | 'guest' | 'superadmin';

export interface MenuItem {
  label: string;
  path: string;
}

export const defaultMenuConfig: Record<NavRole, MenuItem[]> = {
  public: [
    { label: 'Home', path: '/' },
    { label: 'Listings', path: '/listings' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Pricing', path: '/pricing' },
  ],
  business: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Manage Listings', path: '/manage-listings' },
    { label: 'Saved Listings', path: '/saved' },
    { label: 'My Likes', path: '/likes' },
    { label: 'Submit Review', path: '/reviews/submit' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'News & Blog', path: '/news-blog' },
    { label: 'Products & Services', path: '/products' },
    { label: 'Polls & Surveys', path: '/polls' },
    { label: 'Messages', path: '/inbox' },
    { label: 'Team', path: '/team' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Subscription', path: '/subscription' },
  ],
  guest: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Saved Listings', path: '/saved' },
    { label: 'My Likes', path: '/likes' },
    { label: 'Messages', path: '/inbox' },
    { label: 'Profile / Settings', path: '/settings' },
    { label: 'Subscription', path: '/subscription' },
  ],
  superadmin: [
    { label: 'Super Admin', path: '/admin' },
    { label: 'Users Management', path: '/admin/users' },
    { label: 'Organizations Management', path: '/admin/organizations' },
    { label: 'Listings Management', path: '/admin/listings' },
    { label: 'Products & Services Management', path: '/admin/products' },
    { label: 'Reviews & Feedback Management', path: '/admin/reviews' },
    { label: 'Platform Settings', path: '/admin/settings' },
    { label: 'System Logs / Audit Trail', path: '/admin/logs' },
  ],
};

function supabaseEnvAvailable() {
  // Vite exposes env at build time
  return !!(import.meta as any).env?.VITE_SUPABASE_URL && !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
}

export async function fetchMenu(role: NavRole): Promise<MenuItem[]> {
  // Optional DB-driven menu
  if (supabaseEnvAvailable()) {
    try {
      const mod = await import('@/lib/supabase');
      const supabase = (mod as any).supabase as import('@supabase/supabase-js').SupabaseClient;
      const { data, error } = await supabase
        .from('navigation_menus')
        .select('label, path, position')
        .eq('role', role)
        .order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d) => ({ label: d.label, path: d.path }));
      }
    } catch {
      // ignore and fall back to defaults
    }
  }
  return defaultMenuConfig[role];
}
