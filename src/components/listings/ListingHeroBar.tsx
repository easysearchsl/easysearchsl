 import { Listing } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { MapPin, Phone, Smartphone, Star, BadgeCheck, Mail, Share2, Bookmark, Copy, Printer, Heart } from 'lucide-react';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLikesCount } from '@/hooks/useLikesCount';
 import { useAuth } from '@/contexts/AuthContext';

interface ListingHeroBarProps {
  listing: Listing;
  isMockData?: boolean;
}

const formatWhatsAppLink = (raw?: string) => {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  return `https://wa.me/${digits}`;
};

const formatPhoneLink = (raw?: string) => {
  if (!raw) return undefined;
  return `tel:${raw}`;
};

const makeMapsQuery = (listing: Listing) => {
  const parts: string[] = [];
  if (listing.full_address) parts.push(listing.full_address);
  const loc = listing.location || { province: '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  if (loc.chiefdom) parts.push(loc.chiefdom);
  if (loc.district) parts.push(loc.district.replace(' District', ''));
  if (loc.province) parts.push(loc.province);
  const query = parts.join(', ');
  if (!query) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export function ListingHeroBar({ listing, isMockData }: ListingHeroBarProps) {
  const [searchParams] = useSearchParams();
  const isMockUrl = searchParams.get('mock') === '1';
  const allowPrintWithoutLogin = !!isMockData || isMockUrl;
  const whatsappHref = useMemo(() => formatWhatsAppLink(listing.whatsapp_number), [listing.whatsapp_number]);
  const phoneHref = useMemo(() => formatPhoneLink(listing.contact_phone), [listing.contact_phone]);
  const mapsHref = useMemo(() => makeMapsQuery(listing), [listing]);
  const emailHref = useMemo(() => (listing.contact_email ? `mailto:${listing.contact_email}` : undefined), [listing.contact_email]);

  // Note: Share action removed per request for icon-only contact/social actions

  const loc = listing.location || { province: '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  const displayDistrict = loc.district ? loc.district.replace(' District', '') : '';

  // Save listing state & helpers
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);

  // Social share URL for this listing
  const shareUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/listings/${listing.slug}`;
  }, [listing.slug]);

  const getLocalMockSaved = (): string[] => {
    try {
      const raw = localStorage.getItem('mock_saved_ids');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  };

  const setLocalMockSaved = (ids: string[]) => {
    try {
      localStorage.setItem('mock_saved_ids', JSON.stringify(Array.from(new Set(ids.map(String)))));
    } catch {
      // ignore
    }
  };

  // Local likes fallback helpers (mirror saved listing logic)
  const getLocalMockLiked = (): string[] => {
    try {
      const raw = localStorage.getItem('mock_liked_ids');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  };

  const setLocalMockLiked = (ids: string[]) => {
    try {
      localStorage.setItem('mock_liked_ids', JSON.stringify(Array.from(new Set(ids.map(String)))));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const checkSaved = async () => {
      try {
        if (!listing?.id) return;
        if (isAuthenticated && user?.id) {
          // Use real Supabase user when available
          const { data: userData } = await supabase.auth.getUser();
          const dbUserId = userData?.user?.id;
          if (dbUserId) {
            const { data, error: selErr } = await supabase
              .from('saved_listings')
              .select('id')
              .eq('user_id', dbUserId)
              .eq('listing_id', listing.id);
            if (!selErr && Array.isArray(data) && data.length > 0) {
              setSaved(true);
              return;
            }
          }
        }
        // Fallback to local mock storage
        const ids = getLocalMockSaved();
        if (ids.includes(String(listing.id))) setSaved(true);
      } catch (_) {
        // ignore
      }
    };
    checkSaved();
  }, [listing?.id, isAuthenticated, user?.id]);

  // Determine if current user has liked this listing
  useEffect(() => {
    let mounted = true;
    const checkLiked = async () => {
      try {
        if (!listing?.id) return;
        // If not authenticated via app, use local fallback
        if (!isAuthenticated || !user?.id) {
          const ids = getLocalMockLiked();
          if (mounted) setLiked(ids.includes(String(listing.id)));
          return;
        }
        // If authenticated but no Supabase session, also use local fallback
        const { data: userData } = await supabase.auth.getUser();
        const dbUserId = userData?.user?.id;
        if (!dbUserId) {
          const ids = getLocalMockLiked();
          if (mounted) setLiked(ids.includes(String(listing.id)));
          return;
        }
        // Otherwise read from DB
        const { data, error } = await supabase
          .from('listing_likes')
          .select('id')
          .eq('user_id', dbUserId)
          .eq('listing_id', listing.id);
        if (!error && Array.isArray(data) && data.length > 0) {
          if (mounted) setLiked(true);
        } else {
          if (mounted) setLiked(false);
        }
      } catch {
        // ignore
      }
    };
    checkLiked();
    return () => { mounted = false; };
  }, [listing?.id, isAuthenticated, user?.id]);

  const handleSave = useCallback(async () => {
    try {
      if (!listing?.id) return;
      setSaving(true);
      if (!isAuthenticated || !user?.id) {
        // Local-only toggle for mock/testing when not signed in
        const ids = getLocalMockSaved();
        if (saved) {
          const next = ids.filter((id) => String(id) !== String(listing.id));
          setLocalMockSaved(next);
          setSaved(false);
          toast({ title: 'Removed', description: 'Listing removed from your saved items (local).' });
          window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: false } }));
        } else {
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockSaved(ids);
          }
          setSaved(true);
          toast({ title: 'Saved', description: 'Listing saved locally for testing.' });
          window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: true } }));
        }
        setSaving(false);
        return;
      }
      // Prefer Supabase user for persistence; if missing, fallback to local
      const { data: userData } = await supabase.auth.getUser();
      const dbUserId = userData?.user?.id;
      if (!dbUserId) {
        toast({ title: 'Login required', description: 'Please log in with Supabase to save to your account. Saved locally instead.' });
        const ids = getLocalMockSaved();
        if (saved) {
          const next = ids.filter((id) => String(id) !== String(listing.id));
          setLocalMockSaved(next);
          setSaved(false);
          window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: false } }));
        } else {
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockSaved(ids);
          }
          setSaved(true);
          window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: true } }));
        }
        setSaving(false);
        return;
      }
      if (saved) {
        // Try remove from Supabase; also remove from local fallback
        const { error: delErr } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', dbUserId)
          .eq('listing_id', listing.id);
        if (delErr && delErr.code && delErr.code !== 'PGRST116') {
          // ignore if not found; continue cleanup
        }
        const ids = getLocalMockSaved().filter((id) => String(id) !== String(listing.id));
        setLocalMockSaved(ids);
        setSaved(false);
        toast({ title: 'Removed', description: 'Listing removed from your saved items.' });
        window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: false } }));
      } else {
        // Try Supabase first
        const { error: insErr } = await supabase
          .from('saved_listings')
          .insert({ user_id: dbUserId, listing_id: listing.id });
        if (insErr) {
          // Fallback to local mock storage
          const ids = getLocalMockSaved();
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockSaved(ids);
          }
        }
        setSaved(true);
        toast({ title: 'Saved', description: 'Listing saved to your dashboard.' });
        window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: true } }));
      }
    } catch (e: any) {
      toast({ title: 'Action failed', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [listing?.id, saved, toast, isAuthenticated, user?.id]);

  const likesCount = useLikesCount(listing.id);

  const handleToggleLike = useCallback(async () => {
    try {
      if (!listing?.id) return;
      setLiking(true);
      if (!isAuthenticated || !user?.id) {
        // Local-only toggle for mock/testing when not signed in
        const ids = getLocalMockLiked();
        if (liked) {
          const next = ids.filter((id) => String(id) !== String(listing.id));
          setLocalMockLiked(next);
          setLiked(false);
          window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: false } }));
        } else {
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockLiked(ids);
          }
          setLiked(true);
          window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: true } }));
        }
        setLiking(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const dbUserId = userData?.user?.id;
      if (!dbUserId) {
        // No Supabase session: toggle locally just like saved listing
        const ids = getLocalMockLiked();
        if (liked) {
          const next = ids.filter((id) => String(id) !== String(listing.id));
          setLocalMockLiked(next);
          setLiked(false);
          window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: false } }));
        } else {
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockLiked(ids);
          }
          setLiked(true);
          window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: true } }));
        }
        setLiking(false);
        return;
      }

      if (liked) {
        const { error } = await supabase
          .from('listing_likes')
          .delete()
          .eq('user_id', dbUserId)
          .eq('listing_id', listing.id);
        if (error && error.code && error.code !== 'PGRST116') {
          // ignore not-found
        }
        setLiked(false);
        window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: false } }));
      } else {
        const { error } = await supabase
          .from('listing_likes')
          .insert({ user_id: dbUserId, listing_id: listing.id });
        if (error) {
          // ignore and optimistically set
        }
        setLiked(true);
        window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: true } }));
      }
    } catch (e: any) {
      toast({ title: 'Action failed', description: e?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setLiking(false);
    }
  }, [listing?.id, liked, toast, isAuthenticated, user?.id]);

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <Breadcrumb className="mb-2 hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/listings">Listings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {listing.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/listings?category=${encodeURIComponent(listing.category)}`}>{listing.category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{listing.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {listing.logo_url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 border bg-white shadow-sm ring-1 ring-black/10 rounded-full">
                        <AvatarImage loading="lazy" src={listing.logo_url} alt={`${listing.title} logo`} />
                        <AvatarFallback>{(listing.title || 'L').charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{listing.title}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <h1 className="text-xl md:text-2xl font-semibold truncate">{listing.title}</h1>
              {listing.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 text-xs">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {listing.category && <Badge variant="secondary" className="truncate max-w-[200px]">{listing.category}</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{listing.rating?.toFixed?.(1) ?? 0}</span>
                <span>({listing.review_count ?? 0} reviews)</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {[loc.chiefdom, displayDistrict, loc.province].filter(Boolean).join(', ') || 'Location not available'}
                </span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{likesCount}</span>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {/* Social Share first */}
              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <button aria-label="Social Share" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Social Share</TooltipContent>
                </Tooltip>
                <PopoverContent align="end" className="w-auto p-2">
                  <div className="flex items-center gap-2">
                    {/* Facebook Share */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Share to Facebook"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <FaFacebook className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Facebook</TooltipContent>
                    </Tooltip>

                    {/* X / Twitter */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(listing.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Share to X / Twitter"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <FaXTwitter className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>X / Twitter</TooltipContent>
                    </Tooltip>

                    {/* LinkedIn */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Share to LinkedIn"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <FaLinkedin className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn</TooltipContent>
                    </Tooltip>

                    {/* WhatsApp */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${shareUrl}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Share to WhatsApp"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <FaWhatsapp className="h-5 w-5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>WhatsApp</TooltipContent>
                    </Tooltip>

                    {/* Copy Link */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(shareUrl);
                              toast({ title: 'Link copied', description: 'Listing URL copied to clipboard.' });
                            } catch {
                              toast({ title: 'Copy failed', description: 'Could not copy link. Please copy manually.' });
                            }
                          }}
                          aria-label="Copy Link"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Link</TooltipContent>
                    </Tooltip>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Call */}
              {phoneHref && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={phoneHref} aria-label="Call" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                      <Phone className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Call</TooltipContent>
                </Tooltip>
              )}

              {/* Email */}
              {emailHref && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={emailHref} aria-label="Email" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                      <Mail className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Email</TooltipContent>
                </Tooltip>
              )}

              {/* WhatsApp */}
              {whatsappHref && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                      <FaWhatsapp className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>WhatsApp</TooltipContent>
                </Tooltip>
              )}

              {/* Print / Download PDF (requires login) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Print / Download PDF"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                    onClick={async () => {
                      // In mock mode, trigger print immediately to preserve user gesture
                      if (allowPrintWithoutLogin) {
                        toast({ title: 'Opening print dialog…' });
                        try {
                          window.print();
                        } catch {
                          toast({ title: 'Print failed', description: 'Your browser blocked printing. Please try again.' });
                        }
                        return;
                      }

                      // Otherwise, require login
                      if (!isAuthenticated) {
                        toast({
                          title: 'Login required',
                          description: 'Please log in to print or download this listing as PDF.',
                        });
                        return;
                      }
                      toast({ title: 'Opening print dialog…' });
                      try {
                        window.print();
                      } catch {
                        toast({ title: 'Print failed', description: 'Your browser blocked printing. Please try again.' });
                      }
                    }}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Print / PDF</TooltipContent>
              </Tooltip>

              {/* Like Listing (icon-only) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={liked ? 'Unlike Listing' : 'Like Listing'}
                    disabled={liking}
                    onClick={handleToggleLike}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Heart className={liked ? 'h-4 w-4 text-red-500 fill-red-500' : 'h-4 w-4'} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{liked ? 'Unlike Listing' : 'Like Listing'}</TooltipContent>
              </Tooltip>

              {/* Save Listing (icon-only), before Submit Review */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={saved ? 'Unsave' : 'Save Listing'}
                    disabled={saving}
                    onClick={handleSave}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{saved ? 'Unsave' : 'Save Listing'}</TooltipContent>
              </Tooltip>

              {/* Submit Review button */}
              <Link
                to={`/reviews/submit?listing=${encodeURIComponent(listing.slug)}`}
                aria-label="Submit Review"
                className="inline-flex h-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground border-transparent px-3 text-sm hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Submit Review
              </Link>
            </div>
          </TooltipProvider>
          
</div>
      </div>
    </div>
  );
}
