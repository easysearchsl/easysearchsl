import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Building2, Star, Users, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Listing } from "@/types";
import { getFeaturedListings } from "@/lib/listings-search";
import { categoryTree } from "@/data/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { provinces } from "@/data/locations";

const Index = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<Listing[]>([]);
  const topCategories = categoryTree.slice(0, 8);
  const [category, setCategory] = useState("all");
  const [province, setProvince] = useState("all");
  const flatCategories = useMemo(() => {
    const list: { label: string; value: string }[] = [{ label: "All Categories", value: "all" }];
    const addNode = (node: any) => {
      list.push({ label: node.label, value: node.value });
      if (node.children) node.children.forEach((c: any) => addNode(c));
    };
    categoryTree.forEach(addNode);
    return list;
  }, []);

  useEffect(() => {
    getFeaturedListings(3).then((res) => setFeatured(res.listings));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border overflow-hidden">
        {/* Background image + overlay */}
        <div className="absolute inset-0">
          {(() => {
            const heroImage = (featured.find(l => Array.isArray(l.images) && l.images[0])?.images?.[0]) || '/placeholder.svg';
            return (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${heroImage}')` }}
              />
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/90" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Discover Local Businesses
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find the best local businesses, read reviews, and connect with your community.
              From restaurants to services, everything you need is here.
            </p>
            
            {/* Search Bar */}
            <form
              className="max-w-5xl mx-auto mb-8"
              onSubmit={(e) => {
                e.preventDefault();
                const query = q.trim();
                const params = new URLSearchParams();
                if (query) params.set('q', query);
                if (category !== 'all') params.set('category', category);
                if (province !== 'all') params.set('province', province);
                navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2 bg-background/90 border rounded-xl shadow-sm">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    className="pl-10 pr-3 h-[46px] text-base border-border focus:border-primary"
                    placeholder="Search businesses, services, products..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={province} onValueChange={(v) => setProvince(v)}>
                    <SelectTrigger className="w-full h-[46px]">
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {provinces.map((p) => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={category} onValueChange={(v) => setCategory(v)}>
                    <SelectTrigger className="w-full h-[46px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {flatCategories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button type="submit" className="w-full h-[46px]">Search</Button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  <Building2 className="h-5 w-5" />
                  Add Your Business
                </Button>
              </Link>
              <Link to="/listings">
                <Button variant="outline" size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Browse Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to find and connect</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <Search className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">Explore thousands of listings across categories and locations.</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-8">
              <Star className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Compare</h3>
              <p className="text-sm text-muted-foreground">Check ratings, reviews, and details to choose confidently.</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-8">
              <Building2 className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-semibold mb-2">Connect</h3>
              <p className="text-sm text-muted-foreground">Contact businesses directly and get what you need faster.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
          <p className="text-muted-foreground">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {topCategories.map((cat) => (
            <Link key={cat.value} to={`/listings?category=${encodeURIComponent(cat.value)}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-foreground">{cat.label}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Businesses</h2>
            <p className="text-muted-foreground">Discover top-rated local businesses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featured.map((l) => (
              <Card key={l.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{l.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{l.category}</p>
                    </div>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {l.images && l.images[0] && (
                    <img src={l.images[0]} alt={l.title} className="w-full h-40 object-cover rounded-md mb-4" />
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{l.rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({l.review_count} reviews)
                    </span>
                  </div>
                  <Link to={`/listings/${l.slug}`}>
                    <Button variant="outline" className="w-full gap-2">
                      View Listing
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Business Callout */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">Are you a business owner?</h3>
            <p className="text-muted-foreground mt-1">List your business on EasySearch SL to reach more customers.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register">
              <Button size="lg">Register Now</Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">See Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">What People Say</h2>
            <p className="text-muted-foreground">A few words from our community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-foreground/90">“EasySearch SL helped me find reliable suppliers within days. Highly recommend!”</p>
                <div className="mt-3 text-sm text-muted-foreground">— Mariama K.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-foreground/90">“Our shop’s visibility grew after listing. We’re seeing more foot traffic.”</p>
                <div className="mt-3 text-sm text-muted-foreground">— Ibrahim S.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-foreground/90">“Clean interface, great search. I can quickly compare options.”</p>
                <div className="mt-3 text-sm text-muted-foreground">— Aminata T.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
            <p className="text-muted-foreground">Local Businesses</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
            <p className="text-muted-foreground">Customer Reviews</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <p className="text-muted-foreground">Business Categories</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have already boosted their visibility and 
            connected with more customers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                <Building2 className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Users className="h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
