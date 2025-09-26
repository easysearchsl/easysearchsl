import { supabase } from '@/lib/supabase';

export type ThreadId = string;

export interface ThreadSummary {
  thread_id: ThreadId;
  listing_id: string | null;
  listing_title?: string;
  last_message_preview?: string;
  last_message_at?: string;
}

export interface ChatMessage {
  id: string;
  thread_id: ThreadId;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getThreadsForCurrentUser(): Promise<ThreadSummary[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // 1) find threads where current user is a participant
  const { data: participantRows, error: pErr } = await supabase
    .from('thread_participants')
    .select('thread_id')
    .eq('user_id', userId);

  if (pErr || !participantRows?.length) return [];
  const threadIds = participantRows.map(r => r.thread_id);

  // 2) fetch thread + listing title
  const { data: threads, error: tErr } = await supabase
    .from('message_threads')
    .select('id, listing_id')
    .in('id', threadIds)
    .order('created_at', { ascending: false });

  if (tErr || !threads) return [];

  // 3) build map of listing titles
  const listingIds = threads.map(t => t.listing_id).filter(Boolean) as string[];
  let listingTitleById: Record<string, string> = {};
  if (listingIds.length) {
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title')
      .in('id', listingIds);
    (listings ?? []).forEach(l => { listingTitleById[l.id] = l.title; });
  }

  // 4) get last message per thread (naive loop for MVP)
  const summaries: ThreadSummary[] = [];
  for (const t of threads) {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('id, body, created_at')
      .eq('thread_id', t.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    summaries.push({
      thread_id: t.id,
      listing_id: t.listing_id,
      listing_title: t.listing_id ? listingTitleById[t.listing_id] : undefined,
      last_message_preview: lastMsg?.body,
      last_message_at: lastMsg?.created_at,
    });
  }

  return summaries;
}

export async function createOrGetThreadForListing(listingId: string): Promise<ThreadId | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // fetch listing owner
  const { data: listing } = await supabase
    .from('listings')
    .select('id, created_by, title')
    .eq('id', listingId)
    .maybeSingle();
  if (!listing) return null;

  // find existing threads for this user + listing
  const { data: myThreads } = await supabase
    .from('thread_participants')
    .select('thread_id, message_threads!inner(id, listing_id)')
    .eq('user_id', userId)
    .eq('message_threads.listing_id', listingId);

  let threadId: string | null = myThreads?.[0]?.thread_id ?? null;

  if (!threadId) {
    // create thread
    const { data: newThread, error: ctErr } = await supabase
      .from('message_threads')
      .insert({ listing_id: listingId, created_by: userId })
      .select('id')
      .single();
    if (ctErr || !newThread) return null;
    threadId = newThread.id;

    // add participants (current user + listing owner if distinct)
    const participants = [
      { thread_id: threadId, user_id: userId },
      ...(listing.created_by && listing.created_by !== userId
        ? [{ thread_id: threadId, user_id: listing.created_by }]
        : []),
    ];
    await supabase.from('thread_participants').insert(participants);
  }

  return threadId;
}

// Create (or reuse) a general support thread between the current user and a configured support user.
// The support user ID must be set in VITE_SUPPORT_USER_ID and correspond to an auth.users ID in Supabase.
export async function createOrGetSupportThread(): Promise<ThreadId | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supportUserId = (import.meta as any)?.env?.VITE_SUPPORT_USER_ID as string | undefined;
  if (!supportUserId || !supportUserId.trim()) return null;

  // For simplicity and to avoid RLS limitations on cross-participant checks,
  // we create a new thread on demand. Optionally, you could try to reuse the
  // newest thread created by the user with listing_id = null.
  const { data: newThread, error: ctErr } = await supabase
    .from('message_threads')
    .insert({ created_by: userId })
    .select('id')
    .single();
  if (ctErr || !newThread) return null;

  const threadId = newThread.id as string;
  // Add participants: current user and support user (if distinct)
  const participants = [
    { thread_id: threadId, user_id: userId },
    ...(supportUserId !== userId ? [{ thread_id: threadId, user_id: supportUserId }] : []),
  ];
  const { error: pErr } = await supabase.from('thread_participants').insert(participants);
  if (pErr) {
    // Best-effort cleanup to avoid orphaned threads without valid participants
    await supabase.from('message_threads').delete().eq('id', threadId);
    return null;
  }

  return threadId;
}

export async function fetchMessages(threadId: ThreadId): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, thread_id, sender_id, body, created_at, read_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function sendMessage(threadId: ThreadId, body: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId || !body.trim()) return false;
  const { error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, sender_id: userId, body });
  return !error;
}

export function subscribeToThread(threadId: ThreadId, onInsert: (m: ChatMessage) => void) {
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` }, (payload) => {
      onInsert(payload.new as ChatMessage);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

