import { useEffect, useMemo, useState } from 'react';
import { SectionShell } from '@/components/listings/SectionShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Listing } from '@/types';
import { Newspaper, Tag, HelpCircle, Megaphone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getAnnouncements, incrementAnnouncementClick, incrementAnnouncementView } from '@/lib/announcements-store';
import type { Announcement as CTAAnnouncement } from '@/lib/announcements-store';
import { getNewsPosts, incrementNewsView, incrementNewsClick } from '@/lib/news-store';
import type { NewsPost } from '@/lib/news-store';
import { getProducts, incrementProductView, incrementProductClick } from '@/lib/products-store';
import type { Product } from '@/lib/products-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateAnnouncementImage } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContentEngagementSectionProps {
  listing: Listing;
}

export const ContentEngagementSection = ({ listing }: ContentEngagementSectionProps) => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnns] = useState<CTAAnnouncement[]>([]);
  const [viewAnn, setViewAnn] = useState<CTAAnnouncement | null>(null);
  const [viewNews, setViewNews] = useState<NewsPost | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  // Visible counts for "Load More" UX
  const [newsVisible, setNewsVisible] = useState<number>(3);
  const [productsVisible, setProductsVisible] = useState<number>(3);
  const [annsVisible, setAnnsVisible] = useState<number>(6);
  const [psType, setPsType] = useState<'all' | 'product' | 'service'>('all');

  useEffect(() => {
    try {
      const n = getNewsPosts().filter((p) => (p.status === 'published') && ((p.listingId === listing.id) || (Array.isArray(p.listingIds) && p.listingIds.includes(listing.id))));
      const pr = getProducts().filter(
        (p) =>
          p.status === 'published' &&
          (p.listingId === listing.id || (Array.isArray(p.listingIds) && p.listingIds.includes(listing.id)))
      );
      // Announcements: support multi-listings + expiration filtering + limit 5 + mock fallback
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const allAnns = getAnnouncements();
      const filtered = allAnns
        .filter((a) => a.status === 'published')
        .filter((a) => (Array.isArray(a.listingIds) && a.listingIds.includes(listing.id)) || a.listingId === listing.id)
        .filter((a) => !a.expiresAt || a.expiresAt >= todayStr)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      const ensureFive = (items: CTAAnnouncement[]): CTAAnnouncement[] => {
        if (items.length > 0) return items;
        // Mock fallback: 5 items tied to this listing with varied CTA types
        const ctaTypes = ['Announcement', 'Learn More', 'Get Offer', 'Contact Us', 'Book Now'];
        const base: Omit<CTAAnnouncement, 'id' | 'createdAt'> = {
          listingId: listing.id,
          listingTitle: listing.title || 'Listing',
          listingIds: [listing.id],
          listingTitles: [listing.title || 'Listing'],
          ctaType: 'Announcement',
          title: '',
          description: '',
          buttonText: undefined,
          buttonLink: '',
          status: 'published',
          imageDataUrl: undefined,
          expiresAt: undefined,
          updatedAt: undefined,
        };

        const presets = [
          {
            title: 'Grand Opening: New Branch Now Open!',
            description: 'We are excited to welcome you to our newest location. Visit us this week for specials and giveaways.',
            buttonLink: 'https://example.com/grand-opening',
          },
          {
            title: 'Limited-Time Discount — Save 20% This Month',
            description: 'Enjoy special savings on select services. Book today and don’t miss out!',
            buttonLink: 'https://example.com/save-20',
          },
          {
            title: 'We Are Hiring — Join Our Team',
            description: 'Passionate about great service? Apply now for open roles and grow your career with us.',
            buttonLink: 'https://example.com/careers',
          },
          {
            title: 'New Product Launch — Check It Out',
            description: 'Discover the latest addition to our lineup, designed with you in mind.',
            buttonLink: 'https://example.com/new-product',
          },
          {
            title: 'Holiday Hours Update',
            description: 'We will be operating on special hours this holiday. See the schedule and plan your visit.',
            buttonLink: 'https://example.com/holiday-hours',
          },
        ];

        const now = Date.now();
        const mocks: CTAAnnouncement[] = presets.map((p, idx) => ({
          ...base,
          id: `mock-ann-${listing.id}-${idx}`,
          title: p.title,
          description: p.description,
          buttonLink: p.buttonLink,
          ctaType: ctaTypes[idx % ctaTypes.length],
          buttonText: ctaTypes[idx % ctaTypes.length],
          imageDataUrl: generateAnnouncementImage(p.title, p.description, `${listing.id}-${idx}`) || undefined,
          createdAt: new Date(now - idx * 60000).toISOString(),
          // Stagger a couple with future expiry, others undefined
          expiresAt: idx % 2 === 0 ? new Date(now + (idx + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : undefined,
        }));
        return mocks.slice(0, 5);
      };

      setNews(n);
      setProducts(pr);
      setAnns(ensureFive(filtered));
    } catch {
      // no-op in SSR
    }
  }, [listing.id]);

  // Reset visible counts when listing changes
  useEffect(() => {
    setNewsVisible(3);
    setProductsVisible(3);
    setAnnsVisible(6);
  }, [listing.id]);

  // Sort newest first and paginate
  const sortedNews = useMemo(
    () => [...news].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [news]
  );
  const newsToShow = useMemo(
    () => sortedNews.slice(0, newsVisible),
    [sortedNews, newsVisible]
  );

  // Announcements sorting and visible slice
  const sortedAnns = useMemo(
    () => [...announcements].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [announcements]
  );
  const annsToShow = useMemo(
    () => sortedAnns.slice(0, annsVisible),
    [sortedAnns, annsVisible]
  );

  // Products visible slice (keep current order)
  const filteredProducts = useMemo(() => {
    if (psType === 'all') return products;
    return products.filter((p) => p.type === psType);
  }, [products, psType]);
  const productsToShow = useMemo(
    () => filteredProducts.slice(0, productsVisible),
    [filteredProducts, productsVisible]
  );

  const faqs = useMemo(() => listing.faqs || [], [listing.faqs]);

  return (
    <SectionShell title="Content & Engagement" Icon={Newspaper} accent>
        <Tabs defaultValue="news">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="news"><Newspaper className="h-4 w-4 mr-2"/>News & Blog</TabsTrigger>
            <TabsTrigger value="products"><Tag className="h-4 w-4 mr-2"/>Products & Services</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="h-4 w-4 mr-2"/>Announcements</TabsTrigger>
            <TabsTrigger value="faqs"><HelpCircle className="h-4 w-4 mr-2"/>FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="pt-6">
            {news.length === 0 ? (
              <p className="text-sm text-muted-foreground">No news yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newsToShow.map((n) => (
                    <div key={n.id} className="rounded-md border overflow-hidden">
                      {n.coverImageDataUrl ? (
                        <img
                          src={n.coverImageDataUrl}
                          alt={n.title}
                          className="h-32 w-full object-cover cursor-pointer"
                          onClick={() => {
                            try { incrementNewsClick(n.id); } catch (e) {}
                            // Optimistically update local state
                            setNews((prev) => prev.map((x) => x.id === n.id ? { ...x, clickCount: (x.clickCount || 0) + 1 } : x));
                            setViewNews(n);
                          }}
                        />
                      ) : null}
                      <div className="p-4 space-y-2">
                        <div className="font-semibold line-clamp-2">{n.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-3">{n.content}</div>
                        <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</div>
                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              try { incrementNewsView(n.id); } catch (e) {}
                              // Optimistically update local state
                              setNews((prev) => prev.map((x) => x.id === n.id ? { ...x, viewCount: (x.viewCount || 0) + 1 } : x));
                              setViewNews(n);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {newsVisible < sortedNews.length && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => setNewsVisible((v) => Math.min(sortedNews.length, v + 3))}>Load More</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="pt-6">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products or services yet.</p>
            ) : (
              <>
                <div className="flex items-end justify-end mb-3">
                  <div className="w-48 space-y-1">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={psType} onValueChange={(v) => setPsType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="product">Products</SelectItem>
                        <SelectItem value="service">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsToShow.map((p) => {
                    return (
                      <div key={p.id} className="rounded-md border overflow-hidden">
                        {p.imageDataUrl ? (
                          <img src={p.imageDataUrl} alt={p.name} className="h-32 w-full object-cover" />
                        ) : null}
                        <div className="p-4 space-y-1">
                          <div className="font-semibold truncate">{p.name}{p.type === 'service' ? <Badge variant="outline" className="ml-2">Service</Badge> : null}</div>
                          {(p.priceMin != null && p.priceMax != null) ? (
                            <div className="text-sm font-medium text-primary">
                              {(p.currency || 'Le')} {p.priceMin.toLocaleString()} - {p.priceMax.toLocaleString()}
                            </div>
                          ) : p.priceMin != null ? (
                            <div className="text-sm font-medium text-primary">
                              {(p.currency || 'Le')} {p.priceMin.toLocaleString()}
                            </div>
                          ) : p.priceMax != null ? (
                            <div className="text-sm font-medium text-primary">
                              {(p.currency || 'Le')} {p.priceMax.toLocaleString()}
                            </div>
                          ) : p.price != null ? (
                            <div className="text-sm font-medium text-primary">
                              {(p.currency || 'Le')} {p.price.toLocaleString()}
                            </div>
                          ) : null}
                          {p.description && (
                            <div className="text-sm text-muted-foreground line-clamp-3">{p.description}</div>
                          )}
                          <div className="pt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                try { incrementProductView(p.id); } catch (e) {}
                                // Optimistically update local state
                                setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, viewCount: (x.viewCount || 0) + 1 } : x));
                                setViewProduct(p);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {productsVisible < filteredProducts.length && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => setProductsVisible((v) => Math.min(filteredProducts.length, v + 3))}>Load More</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="pt-6">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {annsToShow.map((a) => (
                    <div key={a.id} className="rounded-md border p-4 flex items-start gap-3">
                      {a.imageDataUrl ? (
                        <img src={a.imageDataUrl} alt={a.title} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="mt-1 text-secondary">
                          <Megaphone className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{a.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-3">{a.description}</div>
                      </div>
                      <div className="ml-auto shrink-0 flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            try { incrementAnnouncementView(a.id); } catch (e) {}
                            setViewAnn(a);
                          }}
                        >
                          View
                        </Button>
                        {a.buttonLink?.trim() ? (
                          <Button asChild size="sm">
                            <a
                              href={a.buttonLink.trim().startsWith('http') ? a.buttonLink.trim() : `https://${a.buttonLink.trim()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => { try { incrementAnnouncementClick(a.id); } catch (e) {} }}
                            >
                              {a.ctaType || a.buttonText || 'Open'}
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                {annsVisible < sortedAnns.length && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => setAnnsVisible((v) => Math.min(sortedAnns.length, v + 3))}>Load More</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="faqs" className="pt-6">
            {faqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No FAQs provided.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {faqs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{f.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
        {/* News View Dialog */}
        <Dialog open={!!viewNews} onOpenChange={(open) => { if (!open) setViewNews(null); }}>
          <DialogContent className="sm:max-w-[520px] md:max-w-xl w-full max-h-[85vh] overflow-y-auto">
            {viewNews && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewNews.title}</DialogTitle>
                  <DialogDescription>{viewNews.listingTitle}</DialogDescription>
                </DialogHeader>
                {viewNews.coverImageDataUrl && (
                  <img src={viewNews.coverImageDataUrl} alt={viewNews.title} className="w-full h-44 object-cover rounded" />
                )}
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewNews.content}
                </div>
                {viewNews.tags && viewNews.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {viewNews.tags.map((t) => (
                      <span key={t} className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setViewNews(null)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* Product View Dialog */}
        <Dialog open={!!viewProduct} onOpenChange={(open) => { if (!open) setViewProduct(null); }}>
          <DialogContent className="sm:max-w-[520px] md:max-w-xl w-full max-h-[85vh] overflow-y-auto">
            {viewProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewProduct.name}</DialogTitle>
                  {(viewProduct.priceMin != null && viewProduct.priceMax != null) || viewProduct.priceMin != null || viewProduct.priceMax != null || viewProduct.price != null ? (
                    <DialogDescription>
                      {viewProduct.priceMin != null && viewProduct.priceMax != null
                        ? `${viewProduct.currency || 'Le'} ${viewProduct.priceMin.toLocaleString()} - ${viewProduct.priceMax.toLocaleString()}`
                        : viewProduct.priceMin != null
                        ? `${viewProduct.currency || 'Le'} ${viewProduct.priceMin.toLocaleString()}`
                        : viewProduct.priceMax != null
                        ? `${viewProduct.currency || 'Le'} ${viewProduct.priceMax.toLocaleString()}`
                        : `${viewProduct.currency || 'Le'} ${Number(viewProduct.price).toLocaleString()}`}
                    </DialogDescription>
                  ) : null}
                </DialogHeader>
                {viewProduct.imageDataUrl && (
                  <img src={viewProduct.imageDataUrl} alt={viewProduct.name} className="w-full h-44 object-cover rounded" />
                )}
                {viewProduct.description && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {viewProduct.description}
                  </div>
                )}
                {Array.isArray(viewProduct.tags) && viewProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {viewProduct.tags.map((t) => (
                      <span key={t} className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={() => setViewProduct(null)}>Close</Button>
                    {viewProduct.buttonLink?.trim() ? (
                      <Button asChild>
                        <a
                          href={viewProduct.buttonLink.trim().startsWith('http') ? viewProduct.buttonLink.trim() : `https://${viewProduct.buttonLink.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { try { incrementProductClick(viewProduct.id); } catch (e) {} }}
                        >
                          {viewProduct.buttonText?.trim() || 'Open'}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* Announcement View Dialog */}
        <Dialog open={!!viewAnn} onOpenChange={(open) => !open && setViewAnn(null)}>
          <DialogContent className="sm:max-w-[520px] md:max-w-xl w-full max-h-[85vh] overflow-y-auto">
            {viewAnn && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewAnn.title}</DialogTitle>
                  <DialogDescription>{viewAnn.ctaType || viewAnn.buttonText || 'Announcement'}</DialogDescription>
                </DialogHeader>
                <div className="rounded-md border p-4 flex items-start gap-3">
                  {viewAnn.imageDataUrl ? (
                    <img src={viewAnn.imageDataUrl} alt={viewAnn.title} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="mt-1 text-secondary">
                      <Megaphone className="h-5 w-5" />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {viewAnn.description}
                  </div>
                </div>
                <DialogFooter>
                  <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={() => setViewAnn(null)}>Close</Button>
                    {viewAnn.buttonLink?.trim() ? (
                      <Button asChild>
                        <a
                          href={viewAnn.buttonLink.trim().startsWith('http') ? viewAnn.buttonLink.trim() : `https://${viewAnn.buttonLink.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { try { incrementAnnouncementClick(viewAnn.id); } catch (e) {} }}
                        >
                          {viewAnn.ctaType || viewAnn.buttonText || 'Open'}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
    </SectionShell>
  );
};
