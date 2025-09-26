import { supabase } from './supabase';

/**
 * Attempts to atomically increment a listing's view_count via RPC.
 * Falls back to a read-then-update flow if the RPC is unavailable.
 * Returns the new view_count or null on failure.
 */
export async function incrementListingViewCount(listingId: string): Promise<number | null> {
  try {
    if (!listingId) return null;

    // First try RPC (requires SQL function `increment_listing_views(listing_id uuid)` returning int)
    try {
      const { data, error } = await supabase.rpc('increment_listing_views', { listing_id: listingId });
      if (!error && typeof data === 'number') {
        return data;
      }
    } catch (_) {
      // ignore and fallback
    }

    // Fallback: read current then update
    const { data: current, error: selErr } = await supabase
      .from('listings')
      .select('view_count')
      .eq('id', listingId)
      .single();

    if (selErr) return null;

    const next = (current?.view_count ?? 0) + 1;

    const { data: updated, error: updErr } = await supabase
      .from('listings')
      .update({ view_count: next })
      .eq('id', listingId)
      .select('view_count')
      .single();

    if (updErr) return null;

    return updated?.view_count ?? next;
  } catch (_) {
    return null;
  }
}
