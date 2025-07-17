import { useState, useMemo } from "react";
import { Listing } from "@/types";

export function useSearch(listings: Listing[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedChiefdom, setSelectedChiefdom] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  const filteredResults = useMemo(() => {
    let filtered = listings.filter(listing => {
      // Text search - support natural language queries
      const matchesSearch = searchQuery === "" || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.district && listing.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (listing.chiefdom && listing.chiefdom.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "all" || 
        listing.category.toLowerCase() === selectedCategory.toLowerCase();

      // Status filter (including featured logic)
      const matchesStatus = selectedStatus === "all" || 
        listing.status.toLowerCase() === selectedStatus.toLowerCase() ||
        (selectedStatus === "featured" && listing.featured_until && new Date(listing.featured_until) > new Date());

      // District filter
      const matchesDistrict = selectedDistrict === "all" || 
        (listing.district && listing.district.toLowerCase() === selectedDistrict.toLowerCase());

      // Chiefdom filter
      const matchesChiefdom = selectedChiefdom === "all" || 
        (listing.chiefdom && listing.chiefdom.toLowerCase() === selectedChiefdom.toLowerCase());

      return matchesSearch && matchesCategory && matchesStatus && matchesDistrict && matchesChiefdom;
    });

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered = filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "alphabetical":
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        // For now, sort by featured first, then by creation date
        filtered = filtered.sort((a, b) => {
          const aFeatured = a.featured_until && new Date(a.featured_until) > new Date();
          const bFeatured = b.featured_until && new Date(b.featured_until) > new Date();
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case "engagement":
        // Sort by featured first, then by update frequency
        filtered = filtered.sort((a, b) => {
          const aFeatured = a.featured_until && new Date(a.featured_until) > new Date();
          const bFeatured = b.featured_until && new Date(b.featured_until) > new Date();
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        break;
      case "relevance":
      default:
        // Keep current order but prioritize featured listings
        filtered = filtered.sort((a, b) => {
          const aFeatured = a.featured_until && new Date(a.featured_until) > new Date();
          const bFeatured = b.featured_until && new Date(b.featured_until) > new Date();
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          return 0; // Keep original order for same priority
        });
        break;
    }

    return filtered;
  }, [listings, searchQuery, selectedCategory, selectedStatus, selectedDistrict, selectedChiefdom, sortBy]);

  return {
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
  };
}
