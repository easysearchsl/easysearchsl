
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
    title: "Mountain View Coffee House",
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
    status: "published",
    images: [],
    created_by: "user1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "2",
    organization_id: "org2",
    title: "TechFix Pro Services",
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
    status: "published",
    images: [],
    featured_until: "2024-02-15T00:00:00Z",
    created_by: "user2",
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  },
  {
    id: "3",
    organization_id: "org3",
    title: "FitLife Wellness Studio",
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
    status: "draft",
    images: [],
    created_by: "user3",
    created_at: "2024-01-22T14:30:00Z",
    updated_at: "2024-01-22T14:30:00Z"
  },
  {
    id: "4",
    organization_id: "org4",
    title: "Boutique Fashion House",
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
    status: "published",
    images: [],
    featured_until: "2024-03-01T00:00:00Z",
    created_by: "user4",
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2024-01-25T16:45:00Z"
  }
];

export function Search() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
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
  } = useSearch(mockListings);

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedStatus !== "all", 
    selectedDistrict !== "all",
    selectedChiefdom !== "all"
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedDistrict("all");
    setSelectedChiefdom("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Directory</h1>
          <p className="text-muted-foreground mt-1">
            Find businesses and services using natural language or filters
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Try: 'affordable coffee shops' or 'tech repair services'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
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
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredResults.length}</span> 
            {filteredResults.length === 1 ? ' result' : ' results'} found
            {searchQuery && (
              <span> for "{searchQuery}"</span>
            )}
          </p>
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedCategory}
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Status: {selectedStatus}
                </Badge>
              )}
              {selectedDistrict !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  District: {selectedDistrict}
                </Badge>
              )}
              {selectedChiefdom !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Chiefdom: {selectedChiefdom}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid/List */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredResults.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={() => console.log("Edit", listing.id)}
                onView={() => window.open(`/listings/${listing.id}`, '_blank')}
                onToggleStatus={() => console.log("Toggle status", listing.id)}
                showLocation={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any listings matching your search criteria.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Try:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Using different keywords</li>
                      <li>Removing some filters</li>
                      <li>Checking your spelling</li>
                      <li>Using more general terms</li>
                    </ul>
                  </div>
                </div>
                {(searchQuery || activeFiltersCount > 0) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear search and filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
