import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, DollarSign, MapPin, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredListings = [
  {
    id: 1,
    slug: 'premium-restaurant',
    title: 'Premium Restaurant & Grill',
    tagline: 'Exceptional dining experience with premium ingredients',
    category: 'Restaurant',
    tags: ['Fine Dining', 'Grill', 'Premium'],
    rating: 4.8,
    reviewCount: 124,
    priceRange: '$$$',
    businessHours: 'Mon-Fri 9:00 AM—10:00 PM',
    district: 'Western Area',
    chiefdom: 'Freetown',
    image: '/placeholder.svg',
    featured: true,
    verified: true,
    views: 1205,
    likes: 89
  },
  {
    id: 2,
    slug: 'tech-solutions',
    title: 'Tech Solutions Hub',
    tagline: 'Your one-stop shop for all tech needs',
    category: 'Technology',
    tags: ['IT Support', 'Software', 'Hardware'],
    rating: 4.9,
    reviewCount: 87,
    priceRange: '$$',
    businessHours: 'Mon-Sat 8:00 AM—8:00 PM',
    district: 'Northern Province',
    chiefdom: 'Makeni',
    image: '/placeholder.svg',
    featured: true,
    verified: true,
    views: 892,
    likes: 156
  },
  {
    id: 3,
    slug: 'wellness-center',
    title: 'Wellness & Health Center',
    tagline: 'Complete wellness solutions for mind and body',
    category: 'Healthcare',
    tags: ['Wellness', 'Health', 'Therapy'],
    rating: 4.7,
    reviewCount: 203,
    priceRange: '$$',
    businessHours: 'Mon-Fri 7:00 AM—7:00 PM',
    district: 'Eastern Province',
    chiefdom: 'Kenema',
    image: '/placeholder.svg',
    featured: true,
    verified: true,
    views: 1456,
    likes: 234
  }
];

export default function Featured() {
  const [sortBy, setSortBy] = useState('rating');

  const sortedListings = [...featuredListings].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'views':
        return b.views - a.views;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Featured Listings</h1>
        <p className="text-muted-foreground">
          Discover our premium featured businesses and services
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            Featured
          </Badge>
          <span className="text-sm text-muted-foreground">
            {featuredListings.length} premium listings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            <option value="rating">Rating</option>
            <option value="views">Views</option>
            <option value="reviews">Reviews</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedListings.map((listing) => (
          <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant="default" className="bg-primary/90">
                    Featured
                  </Badge>
                  {listing.verified && (
                    <Badge variant="secondary" className="bg-green-500/90 text-white">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {listing.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {listing.tagline}
                </CardDescription>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{listing.rating}</span>
                    <span className="text-muted-foreground">
                      ({listing.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.priceRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{listing.businessHours}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {listing.chiefdom}, {listing.district}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {listing.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{listing.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{listing.likes}</span>
                    </div>
                  </div>
                  
                  <Link to={`/listings/${listing.slug}`}>
                    <Button size="sm" className="group-hover:bg-primary/90 transition-colors">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-muted/30">
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold mb-2">Want to Feature Your Business?</h3>
            <p className="text-muted-foreground mb-4">
              Get premium placement and reach more customers with our featured listing options
            </p>
            <Button>
              Learn More About Featured Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}