import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CommunicationSection } from '@/components/listings/CommunicationSection';
import { ContentEngagementSection } from '@/components/listings/ContentEngagementSection';
import { MonetizationSection } from '@/components/listings/MonetizationSection';
import { BannerCarousel } from '@/components/listings/BannerCarousel';
import { ListingHeroBar } from '@/components/listings/ListingHeroBar';
import { ListingVideoHoursBar } from '@/components/listings/ListingVideoHoursBar';
import { AboutContactSection } from '@/components/listings/AboutContactSection';
import { SimilarListingsSection } from '@/components/listings/SimilarListingsSection';
import { GallerySection } from '@/components/listings/GallerySection';
import { PollCard } from '@/components/polls/PollCard';

import { Listing, BusinessHours, type PriceRange } from '@/types';
import { supabase } from '@/lib/supabase';
import { incrementListingViewCount } from '@/lib/views';
 

export default function ListingView() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasIncrementedViewCount = useRef(false);

  const defaultHours: BusinessHours = {
    monday: { closed: true },
    tuesday: { closed: true },
    wednesday: { closed: true },
    thursday: { closed: true },
    friday: { closed: true },
    saturday: { closed: true },
    sunday: { closed: true },
  };

  const isPriceRange = (v: any): v is PriceRange =>
    v === 'affordable' || v === 'moderate' || v === 'premium';

  const normalizeListing = (raw: any): Listing => {
    const normalized: Listing = {
      id: raw.id,
      organization_id: raw.organization_id || raw.org_id || 'org1',
      slug: raw.slug,

      title: raw.title || raw.name || 'Untitled',
      tagline: raw.tagline || '',
      description: raw.description || '',
      category: raw.category || 'General',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      location: raw.location || {
        province: raw.province || '',
        district: raw.district || '',
        chiefdom: raw.chiefdom || '',
      },
      full_address: raw.full_address || '',
      business_hours: typeof raw.business_hours === 'string'
        ? (JSON.parse(raw.business_hours) as BusinessHours)
        : (raw.business_hours || defaultHours),
      price_range: isPriceRange(raw.price_range) ? raw.price_range : undefined,

      // Media
      logo_url: raw.logo_url || raw.logo || raw.logoUrl || undefined,
      images: Array.isArray(raw.images) ? raw.images : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],

      faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
      announcements: Array.isArray(raw.announcements) ? raw.announcements : [],
      deals: Array.isArray(raw.deals) ? raw.deals : [],
      menu: Array.isArray(raw.menu) ? raw.menu : [],
      events: Array.isArray(raw.events) ? raw.events : [],

      contact_email: raw.contact_email || undefined,
      contact_phone: raw.contact_phone || undefined,
      whatsapp_number: raw.whatsapp_number || undefined,
      website_url: raw.website_url || undefined,
      contact_person: raw.contact_person || undefined,
      target_audience: Array.isArray(raw.target_audience) ? raw.target_audience : undefined,
      social_links: raw.social_links || {},

      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
      rating: typeof raw.rating === 'number' ? raw.rating : 0,
      review_count: typeof raw.review_count === 'number' ? raw.review_count : 0,
      view_count: raw.view_count || 0,
      likes_count: raw.likes_count || 0,
      booking_enabled: !!raw.booking_enabled,

      status: raw.status || 'published',
      featured_until: raw.featured_until || undefined,
      legal_status: raw.legal_status || undefined,
      year_registered: raw.year_registered || undefined,
      verified: !!raw.verified,
      vision_statement: raw.vision_statement || undefined,
      mission_statement: raw.mission_statement || undefined,

      district: raw.district || undefined,
      chiefdom: raw.chiefdom || undefined,

      created_by: raw.created_by || 'system',
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at || new Date().toISOString(),
    };
    return normalized;
  };

  useEffect(() => {
    document.title = listing ? `${listing.title} | EasySearch` : 'Loading...';
  }, [listing]);

  // Dynamically set Open Graph and Twitter meta tags for social share previews
  useEffect(() => {
    if (!listing) return;
    const doc = document;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/listings/${listing.slug}`;
    const title = `${listing.title} | EasySearch`;
    const description = listing.tagline || listing.description || 'Discover this business on EasySearch.';
    const fallbackOg = 'https://lovable.dev/opengraph-image-p98pqg.png';
    const image = listing.logo_url || (Array.isArray(listing.images) && listing.images[0]) || fallbackOg;

    const upsert = (attr: 'property' | 'name', key: string, content: string) => {
      if (!content) return;
      let el = doc.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = doc.createElement('meta');
        el.setAttribute(attr, key);
        doc.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Open Graph
    upsert('property', 'og:type', 'website');
    upsert('property', 'og:url', url);
    upsert('property', 'og:title', title);
    upsert('property', 'og:description', description);
    upsert('property', 'og:image', image);

    // Twitter
    upsert('name', 'twitter:card', 'summary_large_image');
    upsert('name', 'twitter:title', title);
    upsert('name', 'twitter:description', description);
    upsert('name', 'twitter:image', image);

    // Optional canonical link
    let linkEl = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = doc.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      doc.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', url);

    // Hint external prerender services that the page is ready
    try {
      (window as any).prerenderReady = true;
    } catch (_) {
      // no-op
    }
  }, [listing]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!slug) {
        setError('Missing listing slug');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Fetch from Supabase by slug
        const { data, error: sbError } = await supabase
          .from('listings')
          .select('*')
          .eq('slug', slug)
          .single();

        if (sbError || !data) {
          if (isMounted) {
            setListing(null);
            setIsMockData(false);
            setLoading(false);
          }
          return;
        }

        const normalized = normalizeListing(data);
        if (isMounted) {
          setListing(normalized);
          setIsMockData(false);
          setLoading(false);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || 'Failed to load listing');
          setListing(null);
          setIsMockData(false);
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Increment view count once per mount for real (non-mock) listings
  const incrementedRef = useRef(false);
  useEffect(() => {
    if (!listing?.id || isMockData || incrementedRef.current) return;
    incrementedRef.current = true;
    (async () => {
      const newCount = await incrementListingViewCount(String(listing.id));
      if (typeof newCount === 'number') {
        // Update local state
        setListing((prev) => (prev ? { ...prev, view_count: newCount } : prev));
        // Broadcast to any open listing cards
        try {
          window.dispatchEvent(
            new CustomEvent('listing-view-count-updated', {
              detail: { id: String(listing.id), view_count: newCount },
            })
          );
        } catch {
          // noop
        }
      }
    })();
  }, [listing?.id, isMockData]);

 

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  

  if (!listing) {
    return <div className="container mx-auto px-4 py-8">Listing not found.</div>;
  }

  return (
    <div className="w-full">
      <BannerCarousel images={listing.images} title={listing.title} />
      <ListingHeroBar listing={listing} isMockData={isMockData} />
      <ListingVideoHoursBar listing={listing} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <PollCard listingId={String(listing.id)} />
        <AboutContactSection listing={listing} />
        <GallerySection listing={listing} />
        <ContentEngagementSection listing={listing} />
        <SimilarListingsSection listing={listing} isMockData={isMockData} />
        <CommunicationSection listing={listing} />
        <MonetizationSection listing={listing} />
      </div>
    </div>
  );
}
