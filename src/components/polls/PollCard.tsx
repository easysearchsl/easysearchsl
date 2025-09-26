import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { getActivePollForListing, getPollOptions, getVoteCounts, getLocalVote, setLocalVote, subscribeToVotes, vote } from '@/lib/polls';
import type { Poll, PollOption, VoteCounts } from '@/types/polls';

export function PollCard({ listingId }: { listingId: string }) {
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [counts, setCounts] = useState<VoteCounts>({ counts: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const expired = useMemo(() => {
    if (!poll?.expires_at) return false;
    return new Date(poll.expires_at).getTime() < Date.now();
  }, [poll?.expires_at]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!listingId) return;
      setLoading(true);
      const p = await getActivePollForListing(listingId);
      if (!active) return;
      setPoll(p);
      if (!p) {
        setOptions([]);
        setCounts({ counts: {}, total: 0 });
        setSelected(null);
        setLoading(false);
        return;
      }
      const [opts, cts] = await Promise.all([getPollOptions(p.id), getVoteCounts(p.id)]);
      if (!active) return;
      setOptions(opts);
      setCounts(cts);

      // Determine current vote
      try {
        const { data: userData } = await supabase.auth.getUser();
        const dbUserId = userData?.user?.id as string | undefined;
        if (dbUserId) {
          const { data } = await supabase
            .from('poll_votes')
            .select('option_id')
            .eq('poll_id', p.id)
            .eq('user_id', dbUserId)
            .maybeSingle();
          setSelected((data as any)?.option_id || null);
        } else {
          setSelected(getLocalVote(p.id));
        }
      } catch {
        setSelected(getLocalVote(p.id));
      }

      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [listingId]);

  // Subscribe to realtime inserts for this poll
  useEffect(() => {
    if (!poll?.id || subscribed) return;
    const unsub = subscribeToVotes(poll.id, (optionId) => {
      setCounts((prev) => {
        const next = { ...prev };
        next.counts = { ...next.counts, [optionId]: (next.counts[optionId] || 0) + 1 };
        next.total = next.total + 1;
        return next;
      });
    });

    const localHandler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ pollId: string; optionId: string }>;
        if (ce?.detail?.pollId !== poll?.id) return;
        const optionId = ce.detail.optionId;
        setCounts((prev) => {
          const next = { ...prev };
          next.counts = { ...next.counts, [optionId]: (next.counts[optionId] || 0) + 1 };
          next.total = next.total + 1;
          return next;
        });
      } catch {
        // ignore
      }
    };
    window.addEventListener('poll-vote-updated', localHandler as EventListener);
    setSubscribed(true);

    return () => {
      setSubscribed(false);
      try { unsub(); } catch { /* ignore */ }
      window.removeEventListener('poll-vote-updated', localHandler as EventListener);
    };
  }, [poll?.id, subscribed]);

  const handleVote = async (optionId: string) => {
    if (!poll || expired || !optionId || voting) return;
    setVoting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const dbUserId = userData?.user?.id as string | undefined;

      if (!dbUserId) {
        // Local fallback vote (demo/unauthenticated)
        setLocalVote(poll.id, optionId);
        setSelected(optionId);
        setCounts((prev) => {
          const next = { ...prev };
          next.counts = { ...next.counts, [optionId]: (next.counts[optionId] || 0) + 1 };
          next.total = next.total + 1;
          return next;
        });
        try {
          window.dispatchEvent(new CustomEvent('poll-vote-updated', { detail: { pollId: poll.id, optionId } }));
        } catch {}
        return;
      }

      // Authenticated: call RPC
      const res = await vote(poll.id, optionId);
      if (!res.ok) {
        toast({ title: 'Vote failed', description: res.error || 'Please try again.', variant: 'destructive' });
        return;
      }
      setSelected(optionId);
      // counts will update via realtime subscription; also optimistically update
      setCounts((prev) => {
        const next = { ...prev };
        next.counts = { ...next.counts, [optionId]: (next.counts[optionId] || 0) + 1 };
        next.total = next.total + 1;
        return next;
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) return null;
  if (expired || !poll.is_active) return null;

  return (
    <Card className="border border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {options.map((opt) => {
            const c = counts.counts[opt.id] || 0;
            const pct = counts.total > 0 ? Math.round((c / counts.total) * 100) : 0;
            const isSelected = selected === opt.id;
            return (
              <div key={opt.id} className="p-3 rounded-md border flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{opt.option_text}</div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">{c} ({pct}%)</div>
                  </div>
                  <Progress className="mt-2" value={pct} />
                </div>
                <div className="shrink-0">
                  <Button size="sm" variant={isSelected ? 'secondary' : 'default'} disabled={voting || !!selected} onClick={() => handleVote(opt.id)}>
                    {isSelected ? 'Voted' : 'Vote'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-sm text-muted-foreground">Total participants: {counts.total}</div>
        {poll.expires_at && (
          <div className="text-xs text-muted-foreground">Expires: {new Date(poll.expires_at).toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}
