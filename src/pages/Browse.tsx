import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Star, Search } from 'lucide-react';
import { Listing } from '@/types';
import { categoryTree } from '@/data/categories';
import { provinces } from '@/data/locations';
import { searchListings, getFeaturedListings } from '@/lib/listings-search';
import { ListingCard } from '@/components/shared/ListingCard';

 

export const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name' | 'newest'>('rating');
  const [province, setProvince] = useState('all');
  const [district, setDistrict] = useState('all');
  const [chiefdom, setChiefdom] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 9;
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [featured, setFeatured] = useState<Listing[]>([]);

  const flatCategories = useMemo(() => {
    const list: { label: string; value: string }[] = [{ label: 'All Categories', value: 'all' }];
    const addNode = (node: any) => {
      list.push({ label: node.label, value: node.value });
      if (node.children) node.children.forEach((c: any) => addNode(c));
    };
    categoryTree.forEach(addNode);
    return list;
  }, []);

  const districtOptions = useMemo(() => {
    if (!province || province === 'all') return [] as string[];
    const p = provinces.find((p) => p.name === province);
    return p ? p.districts : [];
  }, [province]);

  // Initialize filters from URL params (q, category, province, district, chiefdom)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').trim();
    const cat = (params.get('category') || 'all').trim();
    const isValidCat = cat === 'all' || flatCategories.some((c) => c.value === cat);
    const pv = (params.get('province') || 'all').trim();
    const dv = (params.get('district') || 'all').trim();
    const cv = (params.get('chiefdom') || '').trim();

    // Province validation
    const provinceValid = pv === 'all' || provinces.some((p) => p.name === pv);
    const nextProvince = provinceValid ? pv : 'all';
    // District validation depends on province
    let nextDistrict = 'all';
    if (dv && dv !== 'all' && nextProvince !== 'all') {
      const p = provinces.find((pp) => pp.name === nextProvince);
      if (p && p.districts.includes(dv)) nextDistrict = dv;
    }

    setSearchQuery(q);
    setCategory(isValidCat ? cat : 'all');
    setProvince(nextProvince);
    setDistrict(nextDistrict);
    setChiefdom(cv);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    searchListings({ query: searchQuery, category, province, district, chiefdom, sortBy, page, perPage })
      .then((res) => {
        if (!isMounted) return;
        if (page === 1) {
          setListings(res.listings);
        } else {
          setListings((prev) => {
            const prevIds = new Set(prev.map((l) => String(l.id)));
            const incoming = res.listings.filter((l) => !prevIds.has(String(l.id)));
            return [...prev, ...incoming];
          });
        }
        setTotal(res.total);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [searchQuery, category, province, district, chiefdom, sortBy, page]);

  useEffect(() => {
    getFeaturedListings(5).then((res) => setFeatured(res.listings));
  }, []);

  // Browse view
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold">Browse Businesses</h1>
            <div className="flex flex-wrap gap-2 w-full">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search businesses..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={province} onValueChange={(v) => { setProvince(v); setDistrict('all'); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={district} onValueChange={(v) => { setDistrict(v); setPage(1); }} disabled={province === 'all'}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districtOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full md:w-56">
                <Input 
                  placeholder="Chiefdom (optional)" 
                  value={chiefdom} 
                  onChange={(e) => { setChiefdom(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">All Listings ({total})</h2>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading listings...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                <div className="flex items-center justify-center mt-6">
                  {page * perPage < total ? (
                    <Button variant="outline" disabled={loading} onClick={() => setPage((p) => p + 1)}>
                      {loading ? 'Loading…' : 'Load More'}
                    </Button>
                  ) : (
                    total > 0 && <div className="text-sm text-muted-foreground">No more results</div>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Featured</h2>
            <div className="space-y-4">
              {featured.map(listing => (
                <Card key={listing.id} className="flex gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/listings/${listing.slug}`)}>
                  <img src={(listing.images && listing.images[0]) || '/placeholder.svg'} alt={listing.title} className="w-20 h-20 object-cover rounded-md" />
                  <div>
                    <h4 className="font-semibold">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {listing.rating} ({listing.review_count} reviews)
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};