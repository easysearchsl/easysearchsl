import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { useSearch } from "@/hooks/useSearch";
import { Search as SearchIcon, Filter, Grid, List, MapPin } from "lucide-react";
import { Listing } from "@/types";

const mockListings: Listing[] = [
  {
    id: "1",
    organization_id: "org1",
    slug: "mountain-view-coffee-house",
    title: "Mountain View Coffee House",
    tagline: "Premium coffee with stunning views",
    description: "Premium coffee and pastries with stunning mountain views. We source our beans directly from local farmers.",
    category: "Food & Beverage",
    tags: ["coffee", "pastries", "organic", "mountain view", "wifi"],
    district: "Western Area",
    chiefdom: "Freetown",
    business_hours: {
      monday: { open: "06:00", close: "20:00" },
      tuesday: { open: "06:00", close: "20:00" },
      wednesday: { open: "06:00", close: "20:00" },
      thursday: { open: "06:00", close: "20:00" },
      friday: { open: "06:00", close: "20:00" },
      saturday: { open: "07:00", close: "21:00" },
      sunday: { open: "07:00", close: "21:00" }
    },
    price_range: "moderate",
    images: [],
    videos: [],
    faqs: [],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "info@mountainview.com",
    social_links: {},
    reviews: [],
    rating: 4.5,
    review_count: 89,
    booking_enabled: false,
    status: "published",
    verified: true,
    created_by: "user1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "2",
    organization_id: "org2",
    slug: "techfix-pro-services",
    title: "TechFix Pro Services",
    tagline: "Fast, reliable tech repairs",
    description: "Professional computer and mobile device repair. Quick turnaround times and competitive pricing.",
    category: "Technology",
    tags: ["repair", "computers", "phones", "professional", "warranty"],
    district: "Northern Province",
    chiefdom: "Bombali",
    business_hours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "16:00" },
      sunday: { closed: true }
    },
    price_range: "budget",
    images: [],
    videos: [],
    faqs: [],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "support@techfix.com",
    social_links: {},
    reviews: [],
    rating: 4.2,
    review_count: 156,
    booking_enabled: true,
    status: "published",
    featured_until: "2024-02-15T00:00:00Z",
    verified: true,
    created_by: "user2",
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  },
  {
    id: "3",
    organization_id: "org3",
    slug: "fitlife-wellness-studio",
    title: "FitLife Wellness Studio",
    tagline: "Modern fitness, personalized training",
    description: "Modern fitness studio with state-of-the-art equipment and certified personal trainers.",
    category: "Health & Fitness",
    tags: ["fitness", "gym", "personal training", "yoga", "nutrition"],
    district: "Eastern Province",
    chiefdom: "Kenema",
    business_hours: {
      monday: { open: "05:00", close: "23:00" },
      tuesday: { open: "05:00", close: "23:00" },
      wednesday: { open: "05:00", close: "23:00" },
      thursday: { open: "05:00", close: "23:00" },
      friday: { open: "05:00", close: "23:00" },
      saturday: { open: "06:00", close: "22:00" },
      sunday: { open: "07:00", close: "21:00" }
    },
    price_range: "premium",
    images: [],
    videos: [],
    faqs: [],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "info@fitlife.com",
    social_links: {},
    reviews: [],
    rating: 4.3,
    review_count: 67,
    booking_enabled: true,
    status: "draft",
    verified: false,
    created_by: "user3",
    created_at: "2024-01-22T14:30:00Z",
    updated_at: "2024-01-22T14:30:00Z"
  },
  {
    id: "4",
    organization_id: "org4",
    slug: "boutique-fashion-house",
    title: "Boutique Fashion House",
    tagline: "Trendy styles, curated collections",
    description: "Trendy clothing and accessories for the modern professional. Curated collections from local and international designers.",
    category: "Retail",
    tags: ["fashion", "clothing", "accessories", "designer", "trendy"],
    district: "Southern Province",
    chiefdom: "Bo",
    business_hours: {
      monday: { open: "10:00", close: "19:00" },
      tuesday: { open: "10:00", close: "19:00" },
      wednesday: { open: "10:00", close: "19:00" },
      thursday: { open: "10:00", close: "19:00" },
      friday: { open: "10:00", close: "20:00" },
      saturday: { open: "09:00", close: "20:00" },
      sunday: { open: "11:00", close: "18:00" }
    },
    price_range: "luxury",
    images: [],
    videos: [],
    faqs: [],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "info@boutiquefashion.com",
    social_links: {
      instagram: "https://instagram.com/boutiquefashion"
    },
    reviews: [],
    rating: 4.6,
    review_count: 234,
    booking_enabled: false,
    status: "published",
    featured_until: "2024-03-01T00:00:00Z",
    verified: true,
    created_by: "user4",
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2024-01-25T16:45:00Z"
  }
];

export default function Search() {
  const [listings] = useState<Listing[]>(mockListings);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedDistrict,
    setSelectedDistrict,
    selectedChiefdom,
    setSelectedChiefdom,
    sortBy,
    setSortBy,
    filteredResults
  } = useSearch(listings);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedDistrict("all");
    setSelectedChiefdom("all");
    setSortBy("relevance");
  };

  const activeFiltersCount = [
    searchQuery !== "",
    selectedCategory !== "all",
    selectedStatus !== "all",
    selectedDistrict !== "all",
    selectedChiefdom !== "all"
  ].filter(Boolean).length;

  const handleViewListing = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      window.open(`/listings/${listing.slug}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Match</h1>
            <p className="text-muted-foreground">
              Discover amazing businesses and services in your area
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for businesses, services, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedChiefdom={selectedChiefdom}
              setSelectedChiefdom={setSelectedChiefdom}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {filteredResults.length} results found
                </h2>
                {searchQuery && (
                  <Badge variant="outline" className="bg-primary/10">
                    Search: "{searchQuery}"
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-4"
            }>
              {filteredResults.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEdit={() => console.log("Edit", listing.id)}
                  onView={() => handleViewListing(listing.id)}
                  onToggleStatus={() => console.log("Toggle", listing.id)}
                  showLocation={true}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredResults.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}