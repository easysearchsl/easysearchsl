import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Listing, type PriceRange as PriceRangeType } from "@/types";
import { cn, isBusinessOpen } from "@/lib/utils";
import { Star, MapPin, Phone, Eye, Heart, Clock, Bookmark, Mail, Share2, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { provinces } from "@/data/locations";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback, useMemo, type MouseEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FaWhatsapp, FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSavedCount } from "@/hooks/useSavedCount";
import { useLikesCount } from "@/hooks/useLikesCount";
import { useAuth } from "@/contexts/AuthContext";

interface ListingCardProps {
  listing: Listing;
}

const PriceRange = ({ range }: { range: PriceRangeType | undefined }) => {
  const dollarSigns = {
    affordable: '$',
    moderate: '$$',
    premium: '$$$',
  };

  if (!range) return null;

  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-600 font-semibold">
        {dollarSigns[range]}
      </span>
      <span className="text-xs text-gray-500 ml-1 capitalize">({range})</span>
    </div>
  );
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const navigate = useNavigate();
  const isOpen = isBusinessOpen(listing.business_hours);
  const isFeatured = listing.featured_until && new Date(listing.featured_until) > new Date();
  const { toast } = useToast();
  const { isAuthenticated, user: authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [viewCount, setViewCount] = useState<number>(listing.view_count ?? 0);
  const savedCount = useSavedCount(listing.id);
  const likesCount = useLikesCount(listing.id);

  const shareUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/listings/${listing.slug}`;
  }, [listing.slug]);

  const getLocalMockSaved = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem('mock_saved_ids');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const setLocalMockSaved = useCallback((ids: string[]) => {
    try {
      localStorage.setItem('mock_saved_ids', JSON.stringify(Array.from(new Set(ids.map(String)))));
    } catch {
      // ignore
    }
  }, []);

  const getLocalMockLiked = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem('mock_liked_ids');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const setLocalMockLiked = useCallback((ids: string[]) => {
    try {
      localStorage.setItem('mock_liked_ids', JSON.stringify(Array.from(new Set(ids.map(String)))));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        if (!listing?.id) return;
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (user) {
          const { data, error } = await supabase
            .from('saved_listings')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', listing.id);
          if (!error && Array.isArray(data) && data.length > 0) {
            if (mounted) setSaved(true);
            return;
          }
        }
        // Fallback: local mock
        const ids = getLocalMockSaved();
        if (ids.includes(String(listing.id))) if (mounted) setSaved(true);
      } catch {
        // ignore
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [listing?.id, getLocalMockSaved]);

  // Determine if user has liked this listing
  useEffect(() => {
    let mounted = true;
    const checkLiked = async () => {
      try {
        if (!listing?.id) return;
        const { data: userData } = await supabase.auth.getUser();
        const dbUserId = userData?.user?.id;
        if (!dbUserId) {
          // Fallback: local mock liked
          const ids = getLocalMockLiked();
          if (mounted) setLiked(ids.includes(String(listing.id)));
          return;
        }
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
  }, [listing?.id, getLocalMockLiked]);

  // Sync local viewCount when listing prop changes
  useEffect(() => {
    setViewCount(listing.view_count ?? 0);
  }, [listing.view_count]);

  // Listen for global view-count updates from ListingView
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ id: string; view_count: number }>;
        if (String(listing.id) === String(ce?.detail?.id) && typeof ce.detail.view_count === 'number') {
          setViewCount(ce.detail.view_count);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('listing-view-count-updated', handler as EventListener);
    return () => window.removeEventListener('listing-view-count-updated', handler as EventListener);
  }, [listing.id]);

  // Listen for global like updates to keep the heart icon in sync across components
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ id: string; liked: boolean }>;
        if (String(listing.id) === String(ce?.detail?.id) && typeof ce.detail.liked === 'boolean') {
          setLiked(ce.detail.liked);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('listing-likes-updated', handler as EventListener);
    return () => window.removeEventListener('listing-likes-updated', handler as EventListener);
  }, [listing.id]);

  const onToggleSave = useCallback(async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      if (!listing?.id) return;
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        // local only
        const ids = getLocalMockSaved();
        if (saved) {
          const next = ids.filter((id) => String(id) !== String(listing.id));
          setLocalMockSaved(next);
          setSaved(false);
          toast({ title: 'Removed', description: 'Listing removed from your saved items (local).' });
        } else {
          if (!ids.includes(String(listing.id))) {
            ids.push(String(listing.id));
            setLocalMockSaved(ids);
          }
          setSaved(true);
          toast({ title: 'Saved', description: 'Listing saved locally for testing.' });
        }
        window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: !saved } }));
        setSaving(false);
        return;
      }

      if (saved) {
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);
        if (error && error.code && error.code !== 'PGRST116') {
          // ignore not-found
        }
        const next = getLocalMockSaved().filter((id) => String(id) !== String(listing.id));
        setLocalMockSaved(next);
        setSaved(false);
        toast({ title: 'Removed', description: 'Listing removed from your saved items.' });
        window.dispatchEvent(new CustomEvent('saved-listings-updated', { detail: { id: String(listing.id), saved: false } }));
      } else {
        const { error } = await supabase
          .from('saved_listings')
          .insert({ user_id: user.id, listing_id: listing.id });
        if (error) {
          // fallback local
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
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [listing?.id, saved, getLocalMockSaved, setLocalMockSaved, toast]);

  const onToggleLike = useCallback(async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      if (!listing?.id) return;
      setLiking(true);
      // If no Supabase session or not authenticated via app, toggle locally
      if (!isAuthenticated || !authUser?.id) {
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
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const dbUserId = userData?.user?.id;
      if (!dbUserId) {
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
          // if unique violation or other, we still optimistically set
        }
        setLiked(true);
        window.dispatchEvent(new CustomEvent('listing-likes-updated', { detail: { id: String(listing.id), liked: true } }));
      }
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setLiking(false);
    }
  }, [listing?.id, liked, isAuthenticated, authUser?.id, getLocalMockLiked, setLocalMockLiked, toast]);

  const handleCardClick = () => {
    navigate(`/listings/${listing.slug}`);
  };

  const getProvinceByDistrict = (districtName: string | undefined) => {
    if (!districtName) return undefined;
    for (const province of provinces) {
      if (province.districts.includes(districtName)) {
        return province.name;
      }
    }
    return undefined;
  };

  const province = getProvinceByDistrict(listing.district);
  const cleanedDistrict = listing.district?.replace(' District', '');
  const locationParts = [listing.chiefdom, cleanedDistrict, province].filter(Boolean);
  const locationString = locationParts.join(' / ');
  const waNumber = listing.whatsapp_number ? listing.whatsapp_number.replace(/[^\d]/g, '') : undefined;
  const fullAddress = listing.full_address || locationString;
  const mapsHref = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : undefined;
  // Build display address: "Chiefdom / Town / Area, District, Province / Region"
  const locObj = listing.location || { province: province || '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  const displayDistrict = (locObj.district || '').replace(' District', '');
  const firstSegment = [locObj.chiefdom].filter(Boolean).join(' / ');
  const addressDisplay = [firstSegment, displayDistrict, locObj.province || province || ''].filter(Boolean).join(', ');
  const tooltipAddress = fullAddress || addressDisplay;

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg w-full flex flex-col h-full group cursor-pointer border rounded-lg"
      onClick={handleCardClick}
    >
      <div className="p-0 relative">
        <div className="aspect-video overflow-hidden">
          <img 
            src={listing.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={saved ? 'Unsave Listing' : 'Save Listing'}
                onClick={onToggleSave}
                disabled={saving}
                className={
                  "absolute top-2 left-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                }
              >
                <Bookmark className={saved ? "h-4 w-4 text-secondary" : "h-4 w-4"} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{saved ? 'Unsave Listing' : 'Save Listing'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Like button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={liked ? 'Unlike Listing' : 'Like Listing'}
                onClick={onToggleLike}
                disabled={liking}
                className={
                  "absolute top-2 left-12 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                }
              >
                <Heart className={liked ? "h-4 w-4 text-red-500 fill-red-500" : "h-4 w-4"} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{liked ? 'Unlike Listing' : 'Like Listing'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="pointer-events-auto">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border bg-white shadow-md ring-1 ring-black/10 rounded-full shrink-0">
                    {listing.logo_url && (
                      <AvatarImage loading="lazy" src={listing.logo_url} alt={`${listing.title} logo`} />
                    )}
                    <AvatarFallback>
                      {(listing.title || 'L')
                        .split(' ')
                        .map((w) => w.charAt(0))
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>{listing.title}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isFeatured && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-md">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2 bg-secondary/10 text-secondary border-secondary/20">
              {listing.category}
            </Badge>
            <PriceRange range={listing.price_range} />
          </div>
          <h3 className="text-lg font-bold leading-tight truncate group-hover:text-secondary">{listing.title}</h3>
          {listing.tagline && <p className="text-sm text-muted-foreground mb-2 truncate">{listing.tagline}</p>}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 border-b pb-3 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-black">{listing.rating.toFixed(1)}</span>
              <span className="text-xs">({listing.review_count})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium">Views: {viewCount}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium">{savedCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Number of users who saved this listing</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium">{likesCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Number of likes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={cn("font-semibold", isOpen ? "text-green-600" : "text-red-600")}>
                {isOpen ? 'Open now' : 'Closed'}
              </span>
            </div>
            {addressDisplay && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <TooltipProvider>
                  <Tooltip>
                    {mapsHref ? (
                      <TooltipTrigger asChild>
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="truncate text-foreground hover:underline"
                        >
                          {addressDisplay}
                        </a>
                      </TooltipTrigger>
                    ) : (
                      <TooltipTrigger asChild>
                        <span className="truncate">{addressDisplay}</span>
                      </TooltipTrigger>
                    )}
                    <TooltipContent>{tooltipAddress}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <TooltipProvider>
              <div className="flex items-center gap-3">
                {/* Social Share */}
                <Popover>
                  <Tooltip>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <button
                          aria-label="Social Share"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <TooltipContent>Social Share</TooltipContent>
                  </Tooltip>
                  <PopoverContent align="end" className="w-auto p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex items-center gap-2">
                      {/* Facebook */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Share to Facebook"
                            title="Facebook"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                          >
                            <FaFacebook className="h-4 w-4" />
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
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Share to X / Twitter"
                            title="X / Twitter"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                          >
                            <FaXTwitter className="h-4 w-4" />
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
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Share to LinkedIn"
                            title="LinkedIn"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                          >
                            <FaLinkedin className="h-4 w-4" />
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
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Share to WhatsApp"
                            title="WhatsApp"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>WhatsApp</TooltipContent>
                      </Tooltip>

                      {/* Copy Link */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await navigator.clipboard.writeText(shareUrl);
                                toast({ title: 'Link copied', description: 'Listing URL copied to clipboard.' });
                              } catch {
                                toast({ title: 'Copy failed', description: 'Could not copy link. Please copy manually.' });
                              }
                            }}
                            aria-label="Copy Link"
                            title="Copy Link"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Link</TooltipContent>
                      </Tooltip>
                    </div>
                  </PopoverContent>
                </Popover>
                {listing.contact_phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`tel:${listing.contact_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Call"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                      >
                        <Phone className="w-4 h-4 text-gray-700" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Call</TooltipContent>
                  </Tooltip>
                )}
                {listing.contact_email && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`mailto:${listing.contact_email}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Email"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                      >
                        <Mail className="w-4 h-4 text-gray-700" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                )}
                {waNumber && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="WhatsApp"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                      >
                        <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          {listing.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="capitalize text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="px-4 pb-4 mt-auto">
        <Button
            size="sm"
            className="bg-secondary text-secondary-foreground w-full transition-all duration-300 hover:bg-secondary/90 hover:shadow-md"
            onClick={(e) => {
                e.stopPropagation(); // prevent card's main click handler from firing
                handleCardClick();
            }}
        >
            View Details
        </Button>
      </div>
    </Card>
  );
};
