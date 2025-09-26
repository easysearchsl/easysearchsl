import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SimpleListing { id: string; title: string; slug: string }

export default function SubmitReview() {
  const { toast } = useToast();
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listings, setListings] = useState<SimpleListing[]>([]);
  const [listingId, setListingId] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          setRequiresAuth(true);
          setLoading(false);
          return;
        }
        // Fetch some listings for selection
        const { data, error } = await supabase
          .from('listings')
          .select('id,title,slug')
          .limit(100);
        if (error) throw error;
        if (mounted) {
          setListings((data as SimpleListing[]) || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          toast({ title: 'Error', description: e?.message || 'Failed to load listings', variant: 'destructive' });
          setLoading(false);
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [toast]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!listingId) {
        toast({ title: 'Select listing', description: 'Please choose a listing to review.' });
        return;
      }
      if (rating < 1 || rating > 5) {
        toast({ title: 'Invalid rating', description: 'Rating must be between 1 and 5', variant: 'destructive' });
        return;
      }
      setSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        toast({ title: 'Sign in required', description: 'Please sign in to submit a review.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }
      const { error } = await supabase
        .from('reviews')
        .insert({ user_id: user.id, listing_id: listingId, rating, comment });
      if (error) throw error;
      toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
      setComment('');
      setRating(5);
      setListingId('');
    } catch (e: any) {
      toast({ title: 'Failed to submit', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Submit Review</h1>
      </div>

      {requiresAuth && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please sign in to submit a review.</p>
          </CardContent>
        </Card>
      )}

      {!requiresAuth && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Write a review</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 animate-pulse rounded-md bg-muted" />
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Listing</label>
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={listingId}
                    onChange={(e) => setListingId(e.target.value)}
                  >
                    <option value="">Select a listing</option>
                    {listings.map((l) => (
                      <option key={l.id} value={l.id}>{l.title} ({l.slug})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-24 rounded-md border px-3 py-2 text-sm"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm min-h-[120px]"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
