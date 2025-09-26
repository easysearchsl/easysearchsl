import { supabase } from '@/lib/supabase';
import type { Poll, PollOption, PollWithOptions, VoteCounts } from '@/types/polls';

export async function getActivePollForListing(listingId: string): Promise<Poll | null> {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('listing_id', listingId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) return (data as Poll) || null;
  } catch {
    // ignore and try local fallback
  }
  // Local fallback
  const local = getLocalPolls();
  const found = local.find((p) => p.listing_id === listingId && !!p.is_active && !isExpired(p.expires_at));
  return found || null;
}

export async function getPollOptions(pollId: string): Promise<PollOption[]> {
  // Local poll id starts with 'local_'
  if (pollId?.startsWith('local_')) {
    const local = getLocalPolls();
    const p = local.find((x) => x.id === pollId);
    return p?.options || [];
  }
  try {
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data as PollOption[];
  } catch {
    return [];
  }
}

export async function getVoteCounts(pollId: string): Promise<VoteCounts> {
  // For local polls, we only reflect this client's local vote
  if (pollId?.startsWith('local_')) {
    const poll = getLocalPolls().find((p) => p.id === pollId);
    const counts: Record<string, number> = {};
    if (poll) {
      const selected = getLocalVote(pollId);
      if (selected) counts[selected] = 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  }
  try {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', pollId);
    if (error || !data) return { counts: {}, total: 0 };
    const counts: Record<string, number> = {};
    for (const row of data as { option_id: string }[]) {
      counts[row.option_id] = (counts[row.option_id] || 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  } catch {
    return { counts: {}, total: 0 };
  }
}

export async function getPollWithOptions(pollId: string): Promise<PollWithOptions | null> {
  const [options, poll] = await Promise.all([
    getPollOptions(pollId),
    (async () => {
      if (pollId?.startsWith('local_')) {
        const local = getLocalPolls().find((p) => p.id === pollId) || null;
        return local as unknown as Poll | null;
      }
      const { data } = await supabase.from('polls').select('*').eq('id', pollId).maybeSingle();
      return (data as Poll) || null;
    })(),
  ]);
  if (!poll) return null;
  return { ...poll, options } as PollWithOptions;
}

export async function vote(pollId: string, optionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('increment_poll_vote', {
      p_poll_id: pollId,
      p_option_id: optionId,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'vote failed' };
  }
}

export function subscribeToVotes(pollId: string, onInsert: (optionId: string) => void) {
  const channel = supabase
    .channel(`poll_votes_${pollId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${pollId}` },
      (payload: any) => {
        const optionId = payload?.new?.option_id as string | undefined;
        if (optionId) onInsert(optionId);
      }
    )
    .subscribe();
  return () => {
    try { supabase.removeChannel(channel); } catch { /* ignore */ }
  };
}

// Local anonymous vote fallback (for demos when no Supabase session)
const LS_KEY = 'mock_poll_votes';
export function getLocalVote(pollId: string): string | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[pollId] || null;
  } catch {
    return null;
  }
}

export function setLocalVote(pollId: string, optionId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[pollId] = optionId;
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// ==========================
// Local Polls (for demos)
// ==========================
const LS_POLLS = 'mock_polls';

type LocalPoll = Poll & { options: PollOption[] };

function isExpired(expires_at?: string | null) {
  if (!expires_at) return false;
  return new Date(expires_at).getTime() < Date.now();
}

export function getLocalPolls(): LocalPoll[] {
  try {
    const raw = localStorage.getItem(LS_POLLS);
    const arr = raw ? (JSON.parse(raw) as LocalPoll[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveLocalPolls(polls: LocalPoll[]) {
  try {
    localStorage.setItem(LS_POLLS, JSON.stringify(polls));
  } catch {
    // ignore
  }
}

export function createLocalPoll({
  title,
  description,
  listing_id,
  options,
  user_id,
  expires_at,
}: {
  title: string;
  description?: string | null;
  listing_id: string;
  options: string[];
  user_id?: string;
  expires_at?: string | null;
}): LocalPoll {
  const id = `local_${Date.now()}`;
  const now = new Date().toISOString();
  const poll: LocalPoll = {
    id,
    title,
    description: description || null,
    user_id: user_id || 'local_user',
    listing_id,
    is_active: true,
    expires_at: expires_at || null,
    created_at: now,
    updated_at: now,
    options: (options || []).slice(0, 6).filter(Boolean).map((text, idx) => ({
      id: `${id}_opt_${idx + 1}`,
      poll_id: id,
      option_text: text,
      created_at: now,
    })),
  };
  const all = getLocalPolls();
  all.unshift(poll);
  saveLocalPolls(all);
  return poll;
}

export function deactivateLocalPoll(pollId: string) {
  const arr = getLocalPolls().map((p) => (p.id === pollId ? { ...p, is_active: false, updated_at: new Date().toISOString() } : p));
  saveLocalPolls(arr);
}
