import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/ListingCard";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
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

const mockListings: Listing[] = [
  {
    id: "1",
    organization_id: "org1",
    slug: "premium-coffee-shop",
    title: "Premium Coffee Shop",
    tagline: "Artisanal coffee, daily roasted",
    description: "Artisanal coffee and pastries in the heart of downtown. We source our beans directly from farmers and roast them fresh daily.",
    category: "Food & Beverage",
    tags: ["coffee", "pastries", "organic", "downtown", "wifi"],
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
    contact_email: "info@premiumcoffee.com",
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
    organization_id: "org1", 
    slug: "tech-repair-services",
    title: "Tech Repair Services",
    tagline: "Fast, reliable tech repairs",
    description: "Professional computer and mobile device repair. Quick turnaround times and competitive pricing.",
    category: "Technology",
    tags: ["repair", "computers", "phones", "professional"],
    business_hours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "18:00" },
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
    contact_email: "support@techrepair.com",
    social_links: {},
    reviews: [],
    rating: 4.2,
    review_count: 156,
    booking_enabled: true,
    status: "published",
    verified: true,
    created_by: "user1",
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  },
  {
    id: "3",
    organization_id: "org1",
    slug: "fitness-studio-draft",
    title: "Fitness Studio Draft",
    tagline: "Your fitness journey awaits",
    description: "Modern fitness studio with state-of-the-art equipment and personal training services.",
    category: "Health & Fitness",
    tags: ["fitness", "gym", "personal training", "equipment"],
    business_hours: {
      monday: { open: "05:00", close: "23:00" },
      tuesday: { open: "05:00", close: "23:00" },
      wednesday: { open: "05:00", close: "23:00" },
      thursday: { open: "05:00", close: "23:00" },
      friday: { open: "05:00", close: "23:00" },
      saturday: { open: "05:00", close: "23:00" },
      sunday: { open: "05:00", close: "23:00" }
    },
    price_range: "premium",
    images: [],
    videos: [],
    faqs: [],
    announcements: [],
    deals: [],
    menu: [],
    events: [],
    contact_email: "info@fitnessstudio.com",
    social_links: {},
    reviews: [],
    rating: 0,
    review_count: 0,
    booking_enabled: false,
    status: "draft",
    verified: false,
    created_by: "user1",
    created_at: "2024-01-22T14:30:00Z",
    updated_at: "2024-01-22T14:30:00Z"
  }
];

export function Listings() {
  const [listings] = useState<Listing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleEditListing = (id: string) => {
    toast({
      title: "Edit Listing",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleViewListing = (id: string) => {
    window.open(`/browse?listing=${id}`, '_blank');
  };

  const handleDeleteListing = (id: string) => {
    toast({
      title: "Delete Listing",
      description: "Are you sure you want to delete this listing?",
      variant: "destructive",
    });
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateListingForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-brand-orange">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">{stats.published}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-600">{stats.draft}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-600">{stats.archived}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
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
          <p className="text-sm text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
          {searchQuery && (
            <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
              Filtered by: "{searchQuery}"
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
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No listings found matching your criteria</p>
              <Button variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}