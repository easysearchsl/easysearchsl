import { useEffect, useMemo, useState } from 'react';
import { Listing } from '@/types';
import { ListingCard } from '@/components/shared/ListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HeartOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function MyLikes() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unliking, setUnliking] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load liked listings from Supabase
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
        const { data: likeRows, error: lErr } = await supabase
          .from('listing_likes')
          .select('listing_id')
          .eq('user_id', sUser.id);
        if (lErr) throw lErr;
        const ids = (likeRows || []).map((row: any) => String(row.listing_id));
        if (!ids.length) {
          if (mounted) setListings([]);
          return;
        }
        const { data: listRows, error } = await supabase
          .from('listings')
          .select('*')
          .in('id', ids);
        if (error) throw error;
        if (mounted) setListings((listRows || []) as any as Listing[]);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load liked listings');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.id]);

  // Stay in sync with like/unlike happening elsewhere
  useEffect(() => {
    const handler = (evt: Event) => {
      const ce = evt as CustomEvent<{ id: string; liked: boolean }>;
      const id = ce?.detail?.id;
      const liked = ce?.detail?.liked;
      if (typeof id === 'undefined') return;
      if (liked) {
        // Fetch the single listing and add if not present
        (async () => {
          try {
            const { data, error } = await supabase
              .from('listings')
              .select('*')
              .eq('id', id)
              .maybeSingle();
            if (!error && data) {
              setListings((prev) => (prev.some((l) => String(l.id) === String(id)) ? prev : [...prev, data as any as Listing]));
            }
          } catch {
            // ignore
          }
        })();
      } else {
        setListings((prev) => prev.filter((l) => String(l.id) !== String(id)));
      }
    };
    window.addEventListener('listing-likes-updated', handler as EventListener);
    return () => window.removeEventListener('listing-likes-updated', handler as EventListener);
  }, []);

  const handleUnlike = async (listingId: string) => {
    try {
      setUnliking((prev) => ({ ...prev, [listingId]: true }));
      try {
        const { data: userData } = await supabase.auth.getUser();
        const sUser = userData?.user;
        if (sUser) {
          const { error } = await supabase
            .from('listing_likes')
            .delete()
            .eq('user_id', sUser.id)
            .eq('listing_id', listingId);
          if (error && error.code && error.code !== 'PGRST116') {
            // ignore not-found, continue with local cleanup
          }
        }
      } catch {
        // ignore server errors and proceed
      }
      setListings((prev) => prev.filter((l) => String(l.id) !== String(listingId)));
      toast({ title: 'Removed', description: 'Listing removed from your likes.' });
      window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listingId), liked: false } }));
    } catch (e: any) {
      toast({ title: 'Failed to remove', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setUnliking((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return listings;
    const q = query.toLowerCase();
    return listings.filter((l) =>
      (l.title || '').toLowerCase().includes(q) ||
      (l.tagline || '').toLowerCase().includes(q) ||
      (l.category || '').toLowerCase().includes(q)
    );
  }, [listings, query]);

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">My Likes</h1>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search liked listings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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

      {!loading && !error && filtered.length === 0 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No liked listings yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Like listings to see them here.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <div key={l.id} className="flex flex-col gap-2">
              <ListingCard listing={l} />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlike(l.id)}
                  disabled={!!unliking[l.id]}
                >
                  <HeartOff className="h-4 w-4 mr-2" />
                  {unliking[l.id] ? 'Removing…' : 'Unlike'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
