import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Returns the number of users who saved a given listing.
 * - Loads initial count from saved_listings (exact count)
 * - Subscribes to realtime INSERT/DELETE for live updates
 */
export function useSavedCount(listingId?: string | number) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!listingId) return;
    let active = true;

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from("saved_listings")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", listingId);
        if (!error && typeof count === "number" && active) setCount(count);
      } catch {
        // ignore; keep default 0
      }
    };

    fetchCount();

    // Realtime subscribe for this listing
    const channel = supabase
      .channel(`saved_listings_count_${listingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "saved_listings", filter: `listing_id=eq.${listingId}` },
        () => setCount((c) => c + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "saved_listings", filter: `listing_id=eq.${listingId}` },
        () => setCount((c) => (c > 0 ? c - 1 : 0))
      )
      .subscribe();

    // Local fallback: listen for app-level custom events from ListingCard toggle
    const localHandler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ id: string | number; saved: boolean }>;
        if (String(ce?.detail?.id) !== String(listingId)) return;
        const saved = !!ce.detail.saved;
        setCount((c) => (saved ? c + 1 : c > 0 ? c - 1 : 0));
      } catch {
        // ignore
      }
    };
    window.addEventListener("saved-listings-updated", localHandler as EventListener);

    return () => {
      active = false;
      try { supabase.removeChannel(channel); } catch { /* ignore */ }
      window.removeEventListener("saved-listings-updated", localHandler as EventListener);
    };
  }, [listingId]);

  return count;
}
