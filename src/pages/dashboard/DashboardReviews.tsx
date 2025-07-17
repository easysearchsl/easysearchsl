import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Review } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockReviews: Review[] = [
  {
    id: "1",
    listing_id: "1",
    user_id: "user1",
    rating: 5,
    title: "Outstanding coffee experience!",
    content: "The atmosphere is perfect for both work and relaxation. The baristas are knowledgeable and the coffee is consistently excellent. I particularly love their seasonal drinks and the cozy seating area.",
    pros: ["Excellent coffee quality", "Great atmosphere", "Friendly staff", "Good WiFi"],
    cons: [],
    verified: true,
    helpful_count: 24,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    listing_id: "1",
    user_id: "user2",
    rating: 4,
    title: "Good coffee, but can get crowded",
    content: "The coffee is really good and the prices are fair. However, it can get quite busy during peak hours and finding a seat can be challenging.",
    pros: ["Quality coffee", "Fair pricing", "Good location"],
    cons: ["Gets crowded", "Limited seating during peak hours"],
    verified: true,
    helpful_count: 15,
    created_at: "2024-01-12T14:30:00Z",
    updated_at: "2024-01-12T14:30:00Z"
  },
  {
    id: "3",
    listing_id: "2",
    user_id: "user3",
    rating: 5,
    title: "Excellent tech repair service",
    content: "They fixed my laptop screen quickly and professionally. The price was very reasonable and they explained everything clearly. Highly recommended!",
    pros: ["Fast service", "Professional staff", "Fair pricing", "Clear communication"],
    cons: [],
    verified: true,
    helpful_count: 18,
    created_at: "2024-01-18T09:15:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  },
  {
    id: "4",
    listing_id: "2",
    user_id: "user4",
    rating: 3,
    title: "Average experience",
    content: "The repair was done correctly but took longer than expected. The staff was friendly but communication could be better regarding timelines.",
    pros: ["Repair done correctly", "Friendly staff"],
    cons: ["Took longer than expected", "Poor communication about timelines"],
    verified: false,
    helpful_count: 7,
    created_at: "2024-01-16T11:20:00Z",
    updated_at: "2024-01-16T11:20:00Z"
  }
];

export default function DashboardReviews() {
  const [reviews] = useState<Review[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedListing, setSelectedListing] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = selectedRating === "all" || 
                         review.rating.toString() === selectedRating;
    
    const matchesListing = selectedListing === "all" || 
                          review.listing_id === selectedListing;

    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "verified" && review.verified) ||
                         (selectedStatus === "unverified" && !review.verified);

    return matchesSearch && matchesRating && matchesListing && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    average_rating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
    verified: reviews.filter(r => r.verified).length,
    recent: reviews.filter(r => {
      const reviewDate = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate >= weekAgo;
    }).length,
    needsResponse: reviews.filter(r => r.rating <= 3).length
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and respond to customer reviews across all your listings
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Bulk Response
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.verified} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-600 flex items-center">
              {stats.average_rating.toFixed(1)}
              <Star className="h-5 w-5 ml-1 fill-current" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.2 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">{stats.recent}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recent Reviews</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-orange-600">{stats.needsResponse}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Needs Response</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              3 stars or below
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12">{count}</span>
                <span className="text-sm text-muted-foreground w-12">{percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="1">Premium Coffee Shop</SelectItem>
                <SelectItem value="2">Tech Repair Services</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Review Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="needs-response">Needs Response</TabsTrigger>
          <TabsTrigger value="high-rated">High Rated</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </p>
              {searchQuery && (
                <Badge variant="outline" className="bg-primary/10">
                  Results for: "{searchQuery}"
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {filteredReviews.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No reviews found matching your criteria
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRating("all");
                      setSelectedListing("all");
                      setSelectedStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-4">
            {reviews.filter(r => {
              const reviewDate = new Date(r.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return reviewDate >= weekAgo;
            }).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="needs-response">
          <div className="space-y-4">
            {reviews.filter(r => r.rating <= 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-rated">
          <div className="space-y-4">
            {reviews.filter(r => r.rating >= 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}