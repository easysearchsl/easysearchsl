import { useState, useEffect } from 'react';
import { Listing } from "@/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/shared/ListingCard";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { provinces } from "@/data/locations";
import { searchListings } from "@/lib/listings-search";

export const Listings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Normalize a district string: lowercase and remove trailing 'district'
  const normalizeDistrict = (s: string) =>
    (s || "").toLowerCase().replace(/\s*district\s*$/i, "").trim();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const { toast } = useToast();

  // Load from Supabase whenever filters change
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const { listings: rows } = await searchListings({
          query: searchQuery || undefined,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          district: selectedLocation === 'all' ? undefined : selectedLocation,
          sortBy: 'rating',
          page: 1,
          perPage: 100,
          status: (selectedStatus as any) === 'all' ? 'published' : (selectedStatus as any),
        });
        if (!active) return;
        setListings(rows);
        setFilteredListings(rows);
      } catch (e: any) {
        if (!active) return;
        setListings([]);
        setFilteredListings([]);
        setError(e?.message || 'Failed to load listings');
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [searchQuery, selectedCategory, selectedStatus, selectedLocation]);

  // Build categories dynamically from current listings so deep-links always work
  const categories = [
    "All Categories",
    ...Array.from(new Set(listings.map((l) => l.category).filter(Boolean)))
  ];
  const statuses = ["All Status", "Published", "Draft", "Archived"];

  const handleEditListing = (id: string) => {
    toast({
      title: "Edit Listing",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleViewListing = (id: string) => {
    const l = listings.find((x) => x.id === id);
    const slug = l?.slug;
    const path = slug ? `/listings/${slug}` : `/listings`;
    window.open(path, '_blank');
  };

  const handleDeleteListing = (id: string) => {
    toast({
      title: "Delete Listing",
      description: "Are you sure you want to delete this listing?",
      variant: "destructive",
    });
  };


  // Apply filters from URL params (?category= & ?district=)
  useEffect(() => {
    const catParam = searchParams.get("category");
    const distParam = searchParams.get("district");
    if (catParam) setSelectedCategory(catParam.toLowerCase());
    if (distParam) setSelectedLocation(normalizeDistrict(distParam));
  }, [searchParams]);


  useEffect(() => {
    // client-side quick refine in case we fetched a broad set
    let result = listings;
    if (selectedLocation !== 'all') {
      result = result.filter((l) => normalizeDistrict(l.district || l.location?.district || '') === selectedLocation);
    }
    setFilteredListings(result);
  }, [listings, selectedLocation]);

  const stats = {
    total: listings.length,
    published: listings.filter(l => l.status === 'published').length,
    draft: listings.filter(l => l.status === 'draft').length,
    archived: listings.filter(l => l.status === 'archived').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Listings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business listings and track their performance
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => navigate('/listings/create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="sticky top-16 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {provinces.map(province => (
                    <SelectGroup key={province.name}>
                      <SelectLabel className="font-bold">{province.name}</SelectLabel>
                      {province.districts.map(district => (
                        <SelectItem key={district} value={normalizeDistrict(district)}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
          {searchQuery && (
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              Filtered by: "{searchQuery}"
            </Badge>
          )}
        </div>

        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {loading ? (
            <p>Loading listings...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <p>No listings found.</p>
            )
          )}
        </div>

        {filteredListings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No listings found matching your criteria</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); setSelectedLocation('all'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}