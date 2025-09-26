-- Atomic view counter increment for listings
-- Usage from Supabase client: rpc('increment_listing_views', { listing_id: '<uuid>' })
create or replace function public.increment_listing_views(listing_id uuid)
returns integer
language sql
security definer
as $$
  update public.listings
  set view_count = coalesce(view_count, 0) + 1
  where id = listing_id
  returning view_count;
$$;

-- Optional: grant execute to anon and authenticated roles as needed
-- adjust according to your RLS policy
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
