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
  title: string;
  description: string;
  category: string;
  tags: string[];
  business_hours: BusinessHours;
  promotional_callout?: string;
  status: 'draft' | 'published' | 'archived';
  images: string[];
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  featured_until?: string;
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
