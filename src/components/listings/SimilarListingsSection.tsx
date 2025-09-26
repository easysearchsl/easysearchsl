import { useEffect, useMemo, useState } from "react";
import { Listing, PriceRange } from "@/types";
import { supabase } from "@/lib/supabase";
import { ListingCard } from "@/components/shared/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { SectionShell } from "@/components/listings/SectionShell";
import { Button } from "@/components/ui/button";

// Ensure price_range conforms to the PriceRange union
const isPriceRange = (v: unknown): v is PriceRange =>
  v === "affordable" || v === "moderate" || v === "premium";

interface SimilarListingsSectionProps {
  listing: Listing;
  isMockData?: boolean;
  limit?: number;
}

export function SimilarListingsSection({ listing, isMockData, limit = 4 }: SimilarListingsSectionProps) {
  const [categoryItems, setCategoryItems] = useState<Listing[]>([]);
  const [districtItems, setDistrictItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const district = useMemo(() => listing.location?.district || listing.district || "", [listing]);
  const category = listing.category;
  const hasDistrict = !!district;
  const hasCategory = !!category;

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        const shuffle = <T,>(arr: T[]): T[] => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        // Fetch a small recent set then filter client-side for simplicity and speed
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .neq('id', listing.id)
          .order('created_at', { ascending: false })
          .limit(36);

        if (error || !Array.isArray(data)) {
          if (active) {
            setCategoryItems([]);
            setDistrictItems([]);
          }
          return;
        }

        // Normalize minimal fields similar to ListingView's logic where necessary
        const normalized: Listing[] = data.map((raw) => ({
          id: raw.id,
          organization_id: raw.organization_id || raw.org_id || 'org1',
          slug: raw.slug,
          title: raw.title || raw.name || 'Untitled',
          tagline: raw.tagline || '',
          description: raw.description || '',
          category: raw.category || 'General',
          tags: Array.isArray(raw.tags) ? raw.tags : [],
          location: raw.location || { province: raw.province || '', district: raw.district || '', chiefdom: raw.chiefdom || '' },
          full_address: raw.full_address || '',
          business_hours: typeof raw.business_hours === 'string' ? JSON.parse(raw.business_hours) : (raw.business_hours || {}),
          price_range: isPriceRange(raw.price_range) ? raw.price_range : undefined,
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
          created_by: raw.created_by,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
        }));

        const pool = normalized.filter((l) => l.id !== listing.id);
        const cat = shuffle(pool.filter((l) => l.category === category)).slice(0, limit);
        const dis = shuffle(pool.filter((l) => (l.location?.district || l.district) === district)).slice(0, limit);
        if (active) {
          setCategoryItems(cat);
          setDistrictItems(dis);
        }
      } catch {
        if (active) {
          setCategoryItems([]);
          setDistrictItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [listing.id, category, district, isMockData, limit]);

  if (loading) {
    return (
      <SectionShell title="Similar Listings" Icon={FaCompass} accent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      </SectionShell>
    );
  }

  if (!categoryItems.length && !districtItems.length) return null;

  return (
    <SectionShell title="Similar Listings" Icon={FaCompass} accent>
      <Tabs
        defaultValue={hasCategory ? "category" : "district"}
        className="w-full"
      >
        <TabsList>
          {hasCategory && (
            <TabsTrigger value="category" className="gap-2">
              Category
              <Badge variant="secondary" className="rounded-full">
                {categoryItems.length}
              </Badge>
            </TabsTrigger>
          )}
          {hasDistrict && (
            <TabsTrigger value="district" className="gap-2">
              District
              <Badge variant="secondary" className="rounded-full">
                {districtItems.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {hasCategory && (
          <TabsContent value="category">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Category: {category}</p>
              <Button asChild variant="secondary" size="sm">
                <Link
                  to={`/listings?category=${encodeURIComponent(category)}`}
                  aria-label={`View all listings in ${category}`}
                >
                  View All
                </Link>
              </Button>
            </div>
            {categoryItems.length ? (
              <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-4 lg:grid lg:grid-cols-4 lg:gap-4">
                  {categoryItems.map((it) => (
                    <div key={it.id} className="min-w-[260px] sm:min-w-[300px] lg:min-w-0">
                      <ListingCard listing={it} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No similar listings found in this category yet.
              </div>
            )}
          </TabsContent>
        )}

        {hasDistrict && (
          <TabsContent value="district">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">District: {district}</p>
              <Button asChild variant="secondary" size="sm">
                <Link
                  to={`/listings?district=${encodeURIComponent(district)}`}
                  aria-label={`View all listings in ${district} district`}
                >
                  View All
                </Link>
              </Button>
            </div>
            {districtItems.length ? (
              <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-4 lg:grid lg:grid-cols-4 lg:gap-4">
                  {districtItems.map((it) => (
                    <div key={it.id} className="min-w-[260px] sm:min-w-[300px] lg:min-w-0">
                      <ListingCard listing={it} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No similar listings found in this district yet.
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </SectionShell>
  );
}
