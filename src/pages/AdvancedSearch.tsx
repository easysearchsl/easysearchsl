import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/ListingCard";
import { AdvancedSearchFilters } from "@/components/search/AdvancedSearchFilters";
import { 
  Search, 
  Filter, 
  SortAsc, 
  Sparkles, 
  Grid, 
  List,
  MapPin,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import { Listing, SearchFilters as SearchFiltersType } from "@/types";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AdvancedSearch() {
  const [naturalQuery, setNaturalQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    listings,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    suggestions
  } = useAdvancedSearch();

  const handleNaturalSearch = (query: string) => {
    setNaturalQuery(query);
    // Process natural language query
    const processedFilters = processNaturalLanguageQuery(query);
    updateFilters(processedFilters);
  };

  const processNaturalLanguageQuery = (query: string): Partial<SearchFiltersType> => {
    const filters: Partial<SearchFiltersType> = { query };
    
    // Simple NLP processing for demo
    if (query.includes('affordable') || query.includes('cheap') || query.includes('budget')) {
      filters.price_range = 'budget';
    }
    if (query.includes('luxury') || query.includes('premium') || query.includes('expensive')) {
      filters.price_range = 'luxury';
    }
    if (query.includes('open now') || query.includes('open today')) {
      filters.business_hours = 'open_now';
    }
    if (query.includes('weekend') || query.includes('weekends')) {
      filters.business_hours = 'open_weekends';
    }
    if (query.includes('highly rated') || query.includes('best rated')) {
      filters.rating = 4;
      filters.sort_by = 'rating';
    }
    
    // Extract categories
    const categories = ['coffee', 'restaurant', 'food', 'tech', 'repair', 'fitness', 'gym', 'salon', 'beauty'];
    categories.forEach(cat => {
      if (query.toLowerCase().includes(cat)) {
        if (cat === 'coffee' || cat === 'restaurant' || cat === 'food') {
          filters.category = 'Food & Beverage';
        } else if (cat === 'tech' || cat === 'repair') {
          filters.category = 'Technology';
        } else if (cat === 'fitness' || cat === 'gym') {
          filters.category = 'Health & Fitness';
        } else if (cat === 'salon' || cat === 'beauty') {
          filters.category = 'Beauty & Wellness';
        }
      }
    });
    
    return filters;
  };

  const quickSearches = [
    { label: "Best coffee shops", icon: "☕", query: "highly rated coffee shops" },
    { label: "Open now", icon: "🕒", query: "open now" },
    { label: "Budget-friendly", icon: "💰", query: "affordable budget friendly" },
    { label: "Tech repair", icon: "🔧", query: "computer phone repair services" },
    { label: "Weekend hours", icon: "📅", query: "open weekends" },
    { label: "Verified only", icon: "✅", query: "verified businesses" }
  ];

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
            <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
            <p className="text-muted-foreground">
              Find exactly what you're looking for with natural language search
            </p>
          </div>
          
          {/* Natural Language Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Try: 'affordable nail salons for students' or 'best coffee shops open now'"
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNaturalSearch(naturalQuery)}
                className="pl-10 pr-20 h-12 text-lg"
              />
              <Button
                onClick={() => handleNaturalSearch(naturalQuery)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Searches */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {quickSearches.map((quick, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleNaturalSearch(quick.query)}
                className="gap-2"
              >
                <span>{quick.icon}</span>
                {quick.label}
              </Button>
            ))}
          </div>

          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNaturalSearch(suggestion)}
                        className="text-sm h-auto p-1"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedSearchFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {searchResults.total} results found
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {naturalQuery && `for "${naturalQuery}"`}
                  </p>
                </div>
                
                {filters.query && (
                  <Badge variant="outline" className="bg-primary/10">
                    Search: {filters.query}
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

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filters.category}
                  <button
                    onClick={() => updateFilters({ ...filters, category: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.price_range && (
                <Badge variant="secondary" className="gap-1">
                  Price: {filters.price_range}
                  <button
                    onClick={() => updateFilters({ ...filters, price_range: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.rating && (
                <Badge variant="secondary" className="gap-1">
                  Rating: {filters.rating}+ stars
                  <button
                    onClick={() => updateFilters({ ...filters, rating: undefined })}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results */}
            {!isLoading && (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "space-y-4"
              }>
                {searchResults.listings.map((listing) => (
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
            )}

            {/* No Results */}
            {!isLoading && searchResults.listings.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNaturalQuery("");
                      updateFilters({});
                    }}
                  >
                    Clear Search
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