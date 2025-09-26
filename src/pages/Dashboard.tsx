import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye, 
  Star,
  BarChart3,
  CreditCard,
  Bookmark,
  MessageSquare,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRole } from "@/hooks/useRole";


export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useRole();

  
  const stats = {
    totalListings: 12,
    activeListings: 10,
    totalViews: 1847,
    totalReviews: 23,
    averageRating: 4.6,
    teamMembers: 3
  };

  const recentActivity = [
    { action: "New review", listing: "Coffee Shop Downtown", time: "2 hours ago" },
    { action: "Listing viewed", listing: "Tech Repair Services", time: "4 hours ago" },
    { action: "Team member added", listing: "Sarah Johnson", time: "1 day ago" },
  ];

  // Lightweight dashboard for registered users (guest role)
  if (role === 'guest') {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome! Manage your saved listings and messages. Upgrade to create and manage listings.
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/subscription')}>
            <CreditCard className="h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Saved Listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">View and manage listings you've saved.</p>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/saved')}>
                <Bookmark className="h-4 w-4" />
                Go to Saved Listings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Continue conversations with businesses.</p>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/inbox')}>
                <MessageSquare className="h-4 w-4" />
                Open Inbox
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explore Listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Find more businesses and services.</p>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/listings')}>
                <Search className="h-4 w-4" />
                Browse Directory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Upgrade to create and manage your own listings and organization.</p>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/subscription')}>
                <CreditCard className="h-4 w-4" />
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business listings.
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/listings/create')}>
          <Plus className="h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageRating} ⭐ average rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              2 active this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/listings/create')}
            >
              <Plus className="h-4 w-4" />
              Create New Listing
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/team')}
            >
              <Users className="h-4 w-4" />
              Invite Team Member
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/polls')}
            >
              <TrendingUp className="h-4 w-4" />
              Manage Polls
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/subscription')}
            >
              <CreditCard className="h-4 w-4" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.listing}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Coffee Shop Downtown", views: 423, rating: 4.8, category: "Food & Beverage" },
              { name: "Tech Repair Services", views: 381, rating: 4.7, category: "Technology" },
              { name: "Fitness Studio Pro", views: 295, rating: 4.6, category: "Health & Wellness" }
            ].map((listing, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{listing.name}</h4>
                  <p className="text-sm text-muted-foreground">{listing.category}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{listing.views}</p>
                    <p className="text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{listing.rating}</p>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/listings')}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}