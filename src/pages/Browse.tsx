import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  Globe,
  Grid,
  List,
  Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PublicListing {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  businessHours: string;
  phone?: string;
  website?: string;
  featured?: boolean;
  images: string[];
}

const mockListings: PublicListing[] = [
  {
    id: "1",
    title: "Premium Coffee Shop",
    description: "Artisanal coffee and pastries in the heart of downtown. We source our beans directly from farmers and roast them fresh daily.",
    category: "Food & Beverage",
    tags: ["coffee", "pastries", "organic", "downtown", "wifi"],
    rating: 4.8,
    reviewCount: 124,
    businessHours: "Mon-Fri 6AM-8PM, Sat-Sun 7AM-9PM",
    phone: "(555) 123-4567",
    website: "premiumcoffee.com",
    featured: true,
    images: []
  },
  {
    id: "2",
    title: "Tech Repair Services",
    description: "Professional computer and mobile device repair. Quick turnaround times and competitive pricing for all your tech needs.",
    category: "Technology",
    tags: ["repair", "computers", "phones", "professional"],
    rating: 4.5,
    reviewCount: 87,
    businessHours: "Mon-Sat 9AM-6PM",
    phone: "(555) 234-5678",
    featured: false,
    images: []
  },
  {
    id: "3",
    title: "Urban Fitness Studio",
    description: "Modern fitness studio with state-of-the-art equipment and personal training services. Group classes available.",
    category: "Health & Fitness",
    tags: ["fitness", "gym", "personal training", "group classes"],
    rating: 4.7,
    reviewCount: 203,
    businessHours: "Mon-Sun 5AM-11PM",
    phone: "(555) 345-6789",
    website: "urbanfitness.com",
    featured: true,
    images: []
  },
  {
    id: "4",
    title: "Artisan Bakery",
    description: "Fresh baked goods daily. Specializing in sourdough breads, croissants, and custom cakes for special occasions.",
    category: "Food & Beverage", 
    tags: ["bakery", "bread", "cakes", "organic", "custom orders"],
    rating: 4.6,
    reviewCount: 156,
    businessHours: "Tue-Sun 6AM-3PM",
    phone: "(555) 456-7890",
    featured: false,
    images: []
  }
];

export function Browse() {
  const [listings] = useState<PublicListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["All Categories", "Food & Beverage", "Technology", "Health & Fitness", "Retail", "Services"];

  const filteredAndSortedListings = listings
    .filter(listing => {
      const matchesSearch = searchQuery === "" || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
        listing.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

  const featuredListings = listings.filter(l => l.featured);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const ListingCard = ({ listing }: { listing: PublicListing }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      {listing.featured && (
        <div className="bg-gradient-to-r from-brand-orange to-brand-blue text-white px-3 py-1 text-xs font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Featured Listing
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-brand-blue transition-colors">
              {listing.title}
            </CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {listing.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(listing.rating)}
            <span className="text-sm font-medium ml-1">{listing.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {listing.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {listing.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{listing.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{listing.businessHours}</span>
          </div>
          {listing.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{listing.phone}</span>
            </div>
          )}
          {listing.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-brand-blue hover:underline">
                {listing.website}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {listing.reviewCount} reviews
          </span>
          <Button size="sm" className="bg-brand-blue hover:bg-brand-blue/90 text-white">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 bg-gradient-to-r from-brand-blue/10 to-brand-orange/10 rounded-lg">
        <h1 className="text-4xl font-bold text-foreground">
          Discover Local Businesses
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find the best local businesses, read reviews, and connect with services in your community
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for restaurants, services, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 text-lg"
          />
        </div>
      </div>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-orange" />
            <h2 className="text-2xl font-bold text-foreground">Featured Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-brand-blue hover:bg-brand-blue/90" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-brand-blue hover:bg-brand-blue/90" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            All Businesses
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedListings.length} results
          </p>
        </div>

        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredAndSortedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {filteredAndSortedListings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No businesses found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all categories
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}