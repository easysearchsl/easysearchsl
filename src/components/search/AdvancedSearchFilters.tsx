import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SearchFilters } from "@/types";
import { X } from "lucide-react";

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
}

export function AdvancedSearchFilters({ filters, onFiltersChange }: AdvancedSearchFiltersProps) {
  const categories = [
    "Food & Beverage",
    "Technology",
    "Health & Fitness",
    "Beauty & Wellness",
    "Professional Services",
    "Retail",
    "Education",
    "Entertainment"
  ];

  const priceRanges = [
    { value: "budget", label: "Budget ($)" },
    { value: "moderate", label: "Moderate ($$)" },
    { value: "premium", label: "Premium ($$$)" },
    { value: "luxury", label: "Luxury ($$$$)" }
  ];

  const businessHourOptions = [
    { value: "open_now", label: "Open Now" },
    { value: "open_weekends", label: "Open Weekends" },
    { value: "open_24h", label: "24/7 Service" }
  ];

  const statusOptions = [
    { value: "featured", label: "Featured" },
    { value: "verified", label: "Verified" }
  ];

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "most_engaging", label: "Most Engaging" }
  ];

  const clearFilter = (filterKey: keyof SearchFilters) => {
    onFiltersChange({ [filterKey]: undefined });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({})}
              className="h-auto p-1"
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select 
            value={filters.category || ""} 
            onValueChange={(value) => onFiltersChange({ category: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <Select 
            value={filters.price_range || ""} 
            onValueChange={(value) => onFiltersChange({ price_range: value as any || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Price</SelectItem>
              {priceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Minimum Rating: {filters.rating || 0}+ stars
          </Label>
          <Slider
            value={[filters.rating || 0]}
            onValueChange={([value]) => onFiltersChange({ rating: value })}
            max={5}
            min={0}
            step={0.5}
            className="py-2"
          />
        </div>

        {/* Business Hours */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Business Hours</Label>
          <Select 
            value={filters.business_hours || ""} 
            onValueChange={(value) => onFiltersChange({ business_hours: value as any || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Hours</SelectItem>
              {businessHourOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <Badge
                key={option.value}
                variant={filters.status === option.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => 
                  onFiltersChange({ 
                    status: filters.status === option.value ? undefined : option.value as any 
                  })
                }
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select 
            value={filters.sort_by || "relevance"} 
            onValueChange={(value) => onFiltersChange({ sort_by: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter('category')}
                  />
                </Badge>
              )}
              {filters.price_range && (
                <Badge variant="secondary" className="gap-1">
                  {priceRanges.find(p => p.value === filters.price_range)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter('price_range')}
                  />
                </Badge>
              )}
              {filters.rating && filters.rating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {filters.rating}+ stars
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter('rating')}
                  />
                </Badge>
              )}
              {filters.business_hours && (
                <Badge variant="secondary" className="gap-1">
                  {businessHourOptions.find(h => h.value === filters.business_hours)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter('business_hours')}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  {statusOptions.find(s => s.value === filters.status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter('status')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}