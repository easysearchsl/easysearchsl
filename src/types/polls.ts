export type UUID = string;

export interface Poll {
  id: UUID;
  title: string;
  description?: string | null;
  user_id: UUID; // creator (auth.users)
  listing_id?: UUID | null;
  is_active: boolean;
  expires_at?: string | null; // ISO
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface PollOption {
  id: UUID;
  poll_id: UUID;
  option_text: string;
  created_at: string; // ISO
}

export interface PollVote {
  id: UUID;
  poll_id: UUID;
  option_id: UUID;
  user_id: UUID;
  created_at: string; // ISO
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface VoteCounts {
  // map option_id -> count
  counts: Record<UUID, number>;
  total: number;
}

export interface PollWithStats extends PollWithOptions {
  votes: VoteCounts;
}
