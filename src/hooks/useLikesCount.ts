import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Returns the number of users who liked a given listing.
 * - Loads initial count from listing_likes (exact count)
 * - Subscribes to realtime INSERT/DELETE for live updates
 */
export function useLikesCount(listingId?: string | number) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!listingId) return;
    let active = true;

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from("listing_likes")
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
      .channel(`listing_likes_count_${listingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listing_likes", filter: `listing_id=eq.${listingId}` },
        () => setCount((c) => c + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "listing_likes", filter: `listing_id=eq.${listingId}` },
        () => setCount((c) => (c > 0 ? c - 1 : 0))
      )
      .subscribe();

    // Local app-level events fired by UI toggles
    const localHandler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ id: string | number; liked: boolean }>;
        if (String(ce?.detail?.id) !== String(listingId)) return;
        const liked = !!ce.detail.liked;
        setCount((c) => (liked ? c + 1 : c > 0 ? c - 1 : 0));
      } catch {
        // ignore
      }
    };
    window.addEventListener("listing-likes-updated", localHandler as EventListener);

    return () => {
      active = false;
      try { supabase.removeChannel(channel); } catch { /* ignore */ }
      window.removeEventListener("listing-likes-updated", localHandler as EventListener);
    };
  }, [listingId]);

  return count;
}
