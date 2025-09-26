import { useEffect, useState } from 'react';
import { Listing } from '@/types';
import { ListingCard } from '@/components/shared/ListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookmarkMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { supabase } from '@/lib/supabase';

export default function SavedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [unsaving, setUnsaving] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // Load saved listings from Supabase (if logged in) + local fallback
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: userData } = await supabase.auth.getUser();
        const sUser = userData?.user;
        if (!sUser) {
          if (mounted) setListings([]);
          return;
        }
        const { data: savedRows, error: sErr } = await supabase
          .from('saved_listings')
          .select('listing_id')
          .eq('user_id', sUser.id);
        if (sErr) throw sErr;
        const ids = (savedRows || []).map((r: any) => r.listing_id).filter(Boolean);
        if (ids.length === 0) {
          if (mounted) setListings([]);
          return;
        }
        const { data: listRows, error: lErr } = await supabase
          .from('listings')
          .select('*')
          .in('id', ids);
        if (lErr) throw lErr;
        if (mounted) setListings((listRows || []) as any as Listing[]);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load saved listings');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Stay in sync with saves/unsaves happening elsewhere
  useEffect(() => {
    const handler = (evt: Event) => {
      const ce = evt as CustomEvent<{ id: string; saved: boolean }>;
      const id = ce?.detail?.id;
      const saved = ce?.detail?.saved;
      if (typeof id === 'undefined') return;
      setListings((prev) => {
        if (saved) {
          const found = mockListings.find((m) => String(m.id) === String(id));
          if (!found) return prev;
          if (prev.some((l) => String(l.id) === String(id))) return prev;
          return [...prev, found];
        }
        return prev.filter((l) => String(l.id) !== String(id));
      });
    };
    window.addEventListener('saved-listings-updated', handler as EventListener);
    return () => window.removeEventListener('saved-listings-updated', handler as EventListener);
  }, []);

  const handleUnsave = async (listingId: string) => {
    try {
      setUnsaving((prev) => ({ ...prev, [listingId]: true }));
      // If logged in, remove from Supabase as well
      try {
        const { data: userData } = await supabase.auth.getUser();
        const sUser = userData?.user;
        if (sUser) {
          const { error } = await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', sUser.id)
            .eq('listing_id', listingId);
          if (error && error.code && error.code !== 'PGRST116') {
            // ignore not-found, continue with local cleanup
          }
        }
      } catch {
        // ignore server errors; proceed with local cleanup
      }
      setListings((prev) => prev.filter((l) => String(l.id) !== String(listingId)));
      toast({ title: 'Removed', description: 'Listing removed from your saved items.' });
      window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listingId), saved: false } }));
    } catch (e: any) {
      toast({ title: 'Failed to remove', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setUnsaving((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Saved Listings</h1>
      </div>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 rounded-lg border animate-pulse bg-muted" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && listings.length === 0 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No saved listings yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Save listings from their pages to see them here.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col gap-2">
              <ListingCard listing={l} />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnsave(l.id)}
                  disabled={!!unsaving[l.id]}
                >
                  <BookmarkMinus className="h-4 w-4 mr-2" />
                  {unsaving[l.id] ? 'Removing…' : 'Unsave'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
