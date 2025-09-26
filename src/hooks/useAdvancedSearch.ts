import { useEffect, useMemo, useState } from "react";
import { Listing, SearchFilters } from "@/types";
import { searchListings } from "@/lib/listings-search";

export function useAdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Fetch matching listings from Supabase based on filters
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const { listings } = await searchListings({
          query: filters.query,
          category: filters.category,
          sortBy: filters.sort_by === 'newest' ? 'newest' : filters.sort_by === 'rating' ? 'rating' : 'reviews',
          page: 1,
          perPage: 50,
          status: 'published',
          province: undefined,
          district: undefined,
          chiefdom: undefined,
        });
        if (!active) return;
        setResults(listings);
      } catch {
        if (!active) return;
        setResults([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [filters.query, filters.category, filters.sort_by]);

  const filteredListings = useMemo(() => {
    let results = [...(results || [])];

    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.tags.some(tag => tag.toLowerCase().includes(query)) ||
        listing.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category) {
      results = results.filter(listing => 
        listing.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Apply price range filter
    if (filters.price_range) {
      results = results.filter(listing => listing.price_range === filters.price_range);
    }

    // Apply rating filter
    if (filters.rating) {
      results = results.filter(listing => listing.rating >= (filters.rating || 0));
    }

    // Apply business hours filter
    if (filters.business_hours === 'open_now') {
      const now = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = dayNames[now.getDay()] as keyof Listing['business_hours'];
      const currentTime = now.getHours() * 100 + now.getMinutes();
      
      results = results.filter(listing => {
        const dayHours = listing.business_hours[currentDay];
        if (dayHours.closed) return false;
        if (!dayHours.open || !dayHours.close) return false;
        
        const openTime = parseInt(dayHours.open.replace(':', ''));
        const closeTime = parseInt(dayHours.close.replace(':', ''));
        
        return currentTime >= openTime && currentTime <= closeTime;
      });
    }

    // Apply status filters
    if (filters.status === 'featured') {
      results = results.filter(listing => 
        listing.featured_until && new Date(listing.featured_until) > new Date()
      );
    } else if (filters.status === 'verified') {
      results = results.filter(listing => listing.verified);
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'most_engaging':
        results.sort((a, b) => b.review_count - a.review_count);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return results;
  }, [filters]);

  const searchResults = {
    listings: filteredListings,
    total: filteredListings.length,
    page: 1,
    per_page: 20,
    filters_applied: filters
  };

  const suggestions = useMemo(() => {
    if (!filters.query) return [];
    
    const suggestions: string[] = [];
    const query = filters.query.toLowerCase();
    
    // Generate category-based suggestions
    if (query.includes('coffee') || query.includes('food')) {
      suggestions.push('coffee shops near me', 'restaurants with delivery');
    }
    if (query.includes('tech') || query.includes('repair')) {
      suggestions.push('computer repair services', 'phone screen replacement');
    }
    if (query.includes('gym') || query.includes('fitness')) {
      suggestions.push('24 hour gyms', 'personal training services');
    }
    
    return suggestions.slice(0, 3);
  }, [filters.query]);

  return {
    listings: results,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    suggestions
  };
}
