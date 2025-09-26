import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/shared/ListingCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { Search as SearchIcon, Filter, Grid, List, MapPin } from "lucide-react";
import { Listing } from "@/types";
export default function Search() {
  const { filters, updateFilters, searchResults, isLoading } = useAdvancedSearch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const searchQuery = filters.query || "";
  const selectedCategory = filters.category || "all";
  const selectedStatus = filters.status || "all";
  const selectedDistrict = filters.district || "all";
  const selectedChiefdom = filters.chiefdom || "all";
  const sortBy = filters.sort_by || "relevance";
  const setSearchQuery = (v: string) => updateFilters({ query: v });
  const setSelectedCategory = (v: string) => updateFilters({ category: v === 'all' ? undefined : v });
  const setSelectedStatus = (v: string) => updateFilters({ status: v === 'all' ? undefined : v as any });
  const setSelectedDistrict = (v: string) => updateFilters({ district: v === 'all' ? undefined : v });
  const setSelectedChiefdom = (v: string) => updateFilters({ chiefdom: v === 'all' ? undefined : v });
  const setSortBy = (v: string) => updateFilters({ sort_by: v as any });
  const filteredResults = searchResults.listings;

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
                />
              ))}
            </div>

            {/* No Results */}
            {(!isLoading && filteredResults.length === 0) && (
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