export interface Organization {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  invited_by?: string;
  joined_at?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  organization_id: string;
  slug: string;
  
  // Core Info
  title: string;
  tagline?: string;
  description: string;
  category: string;
  tags: string[];
  business_hours: BusinessHours;
  price_range?: 'budget' | 'moderate' | 'premium' | 'luxury';
  
  // Media
  images: string[];
  videos: string[];
  
  // Content & Engagement
  faqs: FAQ[];
  announcements: Announcement[];
  deals: Deal[];
  menu: MenuItem[];
  events: Event[];
  
  // Communication
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  social_links: SocialLinks;
  
  // Interaction
  reviews: Review[];
  rating: number;
  review_count: number;
  booking_enabled: boolean;
  
  // Status & Metadata
  status: 'draft' | 'published' | 'archived';
  featured_until?: string;
  verified: boolean;
  promotional_callout?: string;
  
  // Legacy fields (to be removed)
  district?: string;
  chiefdom?: string;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: PlanFeatures;
  is_popular?: boolean;
}

export interface PlanFeatures {
  max_listings: number;
  featured_slots: number;
  ai_credits: number;
  team_members: number;
  analytics: boolean;
  priority_support: boolean;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// New interfaces for enhanced listing structure
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  discount_value?: number;
  code?: string;
  valid_from: string;
  valid_until: string;
  max_uses?: number;
  current_uses: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  dietary_info?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  capacity?: number;
  price?: number;
  registration_required: boolean;
  active: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

// Campaign & Monetization
export interface Campaign {
  id: string;
  organization_id: string;
  listing_id: string;
  title: string;
  type: 'featured' | 'promoted' | 'sponsored';
  budget: number;
  daily_budget: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  start_date: string;
  end_date: string;
  target_audience: TargetAudience;
  metrics: CampaignMetrics;
  created_at: string;
}

export interface TargetAudience {
  categories: string[];
  tags: string[];
  demographics?: {
    age_range?: string;
    interests?: string[];
  };
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost_per_click: number;
  click_through_rate: number;
}

// Search & Filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  price_range?: string;
  business_hours?: 'open_now' | 'open_weekends' | 'open_24h';
  status?: 'featured' | 'verified';
  sort_by?: 'rating' | 'newest' | 'most_engaging' | 'relevance';
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  filters_applied: SearchFilters;
}
