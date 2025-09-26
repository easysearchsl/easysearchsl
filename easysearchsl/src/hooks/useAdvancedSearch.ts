import { useState, useMemo } from "react";
import { Listing, SearchFilters } from "@/types";

// Mock listings data for the advanced search
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
    contact_phone: "+1234567890",
    website_url: "https://premiumcoffee.com",
    social_links: {
      facebook: "https://facebook.com/premiumcoffee",
      instagram: "https://instagram.com/premiumcoffee"
    },
    reviews: [],
    rating: 4.5,
    review_count: 128,
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
      saturday: { open: "10:00", close: "16:00" },
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
    review_count: 89,
    booking_enabled: true,
    status: "published",
    verified: true,
    created_by: "user2",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-18T12:00:00Z"
  },
  {
    id: "3",
    organization_id: "org3",
    slug: "fitness-plus-gym",
    title: "Fitness Plus Gym",
    tagline: "Your fitness journey starts here",
    description: "Modern fitness facility with state-of-the-art equipment and professional trainers.",
    category: "Health & Fitness",
    tags: ["gym", "fitness", "training", "modern", "professional"],
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
    contact_email: "info@fitnessplus.com",
    social_links: {
      instagram: "https://instagram.com/fitnessplus"
    },
    reviews: [],
    rating: 4.7,
    review_count: 156,
    booking_enabled: true,
    status: "published",
    featured_until: "2024-03-01T00:00:00Z",
    verified: true,
    created_by: "user3",
    created_at: "2024-01-05T14:00:00Z",
    updated_at: "2024-01-22T09:00:00Z"
  }
];

export function useAdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  };

  const filteredListings = useMemo(() => {
    let results = mockListings;

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
      const currentDay = dayNames[now.getDay()] as keyof typeof results[0]['business_hours'];
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
    listings: mockListings,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    suggestions
  };
}
