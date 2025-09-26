import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/ListingCard";
import { Plus, Search, Filter, Grid, List, TrendingUp, Eye, Star } from "lucide-react";
import { Listing } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreateListingForm } from "@/components/forms/CreateListingForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const mockListings: Listing[] = [
  {
    id: "1",
    organization_id: "org1",
    slug: "premium-coffee-shop",
    title: "Premium Coffee Shop",
    tagline: "Artisanal coffee crafted with passion",
    description: "We source our beans directly from farmers and roast them fresh daily. Experience the perfect blend of quality and sustainability.",
    category: "Food & Beverage",
    tags: ["coffee", "pastries", "organic", "downtown", "wifi", "sustainable"],
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
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop"
    ],
    videos: [],
    faqs: [
      { id: "1", question: "Do you offer WiFi?", answer: "Yes, we provide free high-speed WiFi for all customers.", order: 1 },
      { id: "2", question: "Are you open on holidays?", answer: "We're open on most holidays with modified hours. Check our announcements for details.", order: 2 }
    ],
    announcements: [
      { id: "1", title: "New Winter Menu", content: "Try our seasonal drinks and pastries!", type: "info", active: true, created_at: "2024-01-20T10:00:00Z" }
    ],
    deals: [
      { id: "1", title: "Happy Hour Coffee", description: "50% off all drinks 3-5 PM", discount_type: "percentage", discount_value: 50, valid_from: "2024-01-01", valid_until: "2024-12-31", max_uses: 100, current_uses: 23, active: true }
    ],
    menu: [
      { id: "1", name: "Espresso", description: "Rich, bold coffee shot", price: 2.50, category: "Coffee", available: true, dietary_info: ["vegan"] },
      { id: "2", name: "Cappuccino", description: "Espresso with steamed milk foam", price: 4.00, category: "Coffee", available: true, dietary_info: ["vegetarian"] }
    ],
    events: [],
    contact_email: "info@premiumcoffee.com",
    contact_phone: "+1-555-0123",
    website_url: "https://premiumcoffee.com",
    social_links: {
      facebook: "https://facebook.com/premiumcoffee",
      instagram: "https://instagram.com/premiumcoffee"
    },
    reviews: [
      { id: "1", listing_id: "1", user_id: "user1", rating: 5, title: "Amazing coffee!", content: "Best coffee in town, great atmosphere.", pros: ["Great coffee", "Cozy atmosphere"], cons: [], verified: true, helpful_count: 12, created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" }
    ],
    rating: 4.8,
    review_count: 47,
    booking_enabled: false,
    status: "published",
    verified: true,
    created_by: "user1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "2",
    organization_id: "org1",
    slug: "tech-repair-services",
    title: "Tech Repair Services",
    tagline: "Expert repairs, affordable prices",
    description: "Professional computer and mobile device repair with quick turnaround times and competitive pricing. We handle everything from screen replacements to data recovery.",
    category: "Technology",
    tags: ["repair", "computers", "phones", "professional", "warranty", "data-recovery"],
    business_hours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "10:00", close: "16:00" },
      sunday: { closed: true }
    },
    price_range: "budget",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop"
    ],
    videos: [],
    faqs: [
      { id: "1", question: "How long does a typical repair take?", answer: "Most repairs are completed within 2-3 business days.", order: 1 },
      { id: "2", question: "Do you offer warranties?", answer: "Yes, all repairs come with a 90-day warranty.", order: 2 }
    ],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "support@techrepair.com",
    contact_phone: "+1-555-0456",
    website_url: "https://techrepairservices.com",
    social_links: {
      facebook: "https://facebook.com/techrepairservices"
    },
    reviews: [
      { id: "2", listing_id: "2", user_id: "user2", rating: 5, title: "Fixed my laptop perfectly", content: "Quick service and fair pricing. Highly recommended!", pros: ["Fast service", "Fair pricing"], cons: [], verified: true, helpful_count: 8, created_at: "2024-01-10T14:00:00Z", updated_at: "2024-01-10T14:00:00Z" }
    ],
    rating: 4.7,
    review_count: 23,
    booking_enabled: true,
    status: "published",
    verified: true,
    created_by: "user1",
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  }
];

export default function DashboardListings() {
  const [listings] = useState<Listing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleEditListing = (id: string) => {
    navigate(`/dashboard/listings/${id}/edit`);
  };

  const handleViewListing = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      window.open(`/listings/${listing.slug}`, '_blank');
    }
  };

  const handlePromoteListing = (id: string) => {
    navigate(`/dashboard/campaigns/new?listing=${id}`);
  };

  const categories = ["All Categories", "Food & Beverage", "Technology", "Health & Fitness", "Retail", "Services"];
  const statuses = ["All Status", "Published", "Draft", "Archived"];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           listing.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesStatus = selectedStatus === "all" || 
                         listing.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: listings.length,
    published: listings.filter(l => l.status === 'published').length,
    draft: listings.filter(l => l.status === 'draft').length,
    archived: listings.filter(l => l.status === 'archived').length,
    avgRating: listings.reduce((acc, l) => acc + l.rating, 0) / listings.length,
    totalViews: listings.reduce((acc, l) => acc + (l.review_count * 10), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your business listings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateListingForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Listings</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.published} published, {stats.draft} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">{stats.totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {listings.reduce((acc, l) => acc + l.review_count, 0)} reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">{stats.published}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Live Listings</p>
            <p className="text-xs text-muted-foreground mt-1">
              {listings.filter(l => l.verified).length} verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
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
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
          {searchQuery && (
            <Badge variant="outline" className="bg-primary/10">
              Results for: "{searchQuery}"
            </Badge>
          )}
        </div>

        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={() => handleEditListing(listing.id)}
              onView={() => handleViewListing(listing.id)}
              onToggleStatus={() => console.log("Toggle status", listing.id)}
              showLocation={true}
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No listings found matching your criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
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