
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SearchFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (value: string) => void;
  selectedChiefdom: string;
  setSelectedChiefdom: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function SearchFilters({
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
  onClearFilters,
  activeFiltersCount
}: SearchFiltersProps) {
  const categories = [
    "Food & Beverage",
    "Technology", 
    "Health & Fitness",
    "Retail",
    "Services",
    "Education",
    "Entertainment",
    "Automotive",
    "Real Estate",
    "Professional Services"
  ];

  const districts = [
    "Western Area",
    "Northern Province",
    "Southern Province", 
    "Eastern Province"
  ];

  const chiefdoms = [
    "Freetown",
    "Waterloo",
    "Bombali",
    "Kambia",
    "Koinadugu",
    "Port Loko",
    "Tonkolili",
    "Bo",
    "Bonthe",
    "Moyamba",
    "Pujehun",
    "Kenema",
    "Kailahun",
    "Kono"
  ];

  const statuses = ["Published", "Featured", "Draft"];
  
  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "rating", label: "Highest Rated" },
    { value: "engagement", label: "Most Engaging" },
    { value: "alphabetical", label: "A to Z" }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all ({activeFiltersCount})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status.toLowerCase()}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                District
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district} value={district.toLowerCase()}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chiefdom Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Chiefdom
              </label>
              <Select value={selectedChiefdom} onValueChange={setSelectedChiefdom}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Chiefdoms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chiefdoms</SelectItem>
                  {chiefdoms.map(chiefdom => (
                    <SelectItem key={chiefdom} value={chiefdom.toLowerCase()}>
                      {chiefdom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9">
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

            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-1">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => setSelectedStatus("featured")}
                >
                  Featured
                </Badge>
                <Badge 
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs"
                  onClick={() => setSelectedStatus("published")}
                >
                  Published
                </Badge>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Active:</span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {selectedCategory}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedCategory("all")}
                    />
                  </Badge>
                )}
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {selectedStatus}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedStatus("all")}
                    />
                  </Badge>
                )}
                {selectedDistrict !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    District: {selectedDistrict}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedDistrict("all")}
                    />
                  </Badge>
                )}
                {selectedChiefdom !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Chiefdom: {selectedChiefdom}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedChiefdom("all")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
