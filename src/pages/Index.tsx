import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Building2, Star, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MainNavigation } from "@/components/layout/MainNavigation";

const Index = () => {
  const categories = [
    "Technology", "Food & Beverage", "Health & Wellness", "Education", 
    "Professional Services", "Retail", "Entertainment", "Home Services"
  ];

  const featuredListings = [
    {
      id: 1,
      title: "TechHub Co-working Space",
      category: "Professional Services",
      rating: 4.9,
      reviewCount: 127,
      tags: ["Co-working", "Tech", "Networking"]
    },
    {
      id: 2,
      title: "Green Valley Organic Market",
      category: "Food & Beverage",
      rating: 4.7,
      reviewCount: 89,
      tags: ["Organic", "Local", "Fresh"]
    },
    {
      id: 3,
      title: "Wellness Center Downtown",
      category: "Health & Wellness",
      rating: 4.8,
      reviewCount: 156,
      tags: ["Yoga", "Meditation", "Spa"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Discover Local Businesses
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find the best local businesses, read reviews, and connect with your community.
              From restaurants to services, everything you need is here.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-12 pr-4 py-4 text-lg border-2 border-border focus:border-primary"
                placeholder="Search for businesses, services, or products..."
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  <Building2 className="h-5 w-5" />
                  Add Your Business
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Browse Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
          <p className="text-muted-foreground">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground">{category}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Businesses</h2>
            <p className="text-muted-foreground">Discover top-rated local businesses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{listing.category}</p>
                    </div>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{listing.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({listing.reviewCount} reviews)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
            <p className="text-muted-foreground">Local Businesses</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
            <p className="text-muted-foreground">Customer Reviews</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <p className="text-muted-foreground">Business Categories</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have already boosted their visibility and 
            connected with more customers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                <Building2 className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Users className="h-5 w-5" />
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
