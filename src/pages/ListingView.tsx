import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Play,
  Heart,
  Share2,
  MessageSquare,
  Calendar,
  Gift,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const mockListing = {
  id: 1,
  slug: 'premium-restaurant',
  title: 'Premium Restaurant & Grill',
  tagline: 'Exceptional dining experience with premium ingredients',
  category: 'Restaurant',
  tags: ['Fine Dining', 'Grill', 'Premium', 'Canqz'],
  rating: 4.8,
  reviewCount: 124,
  priceRange: '$$$',
  businessHours: {
    'Mon-Fri': '9:00 AM—6:00 PM',
    'Sat': '10:00 AM—8:00 PM',
    'Sun': 'Closed'
  },
  district: 'Western Area',
  chiefdom: 'Freetown',
  images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
  videos: ['/placeholder.svg'],
  website: 'https://example.com',
  email: 'info@premium-restaurant.com',
  phone: '+232 XX XXX XXXX',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com'
  },
  faqs: [
    {
      question: 'What are your operating hours?',
      answer: 'We are open Monday to Friday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 8:00 PM. We are closed on Sundays.'
    },
    {
      question: 'Do you take reservations?',
      answer: 'Yes, we accept reservations. You can book through our website or call us directly.'
    }
  ],
  announcements: [
    {
      title: 'New Menu Items Available',
      content: 'We have added exciting new dishes to our menu. Come and try our chef specials!',
      date: '2024-01-15'
    }
  ],
  deals: [
    {
      title: '20% Off Weekend Specials',
      description: 'Get 20% off all weekend special dishes every Saturday and Sunday',
      validUntil: '2024-02-29'
    }
  ],
  menu: [
    {
      category: 'Appetizers',
      items: [
        { name: 'Grilled Prawns', price: 'Le 45,000', description: 'Fresh prawns grilled to perfection' },
        { name: 'Chicken Wings', price: 'Le 35,000', description: 'Spicy chicken wings with dipping sauce' }
      ]
    },
    {
      category: 'Main Courses',
      items: [
        { name: 'Grilled Fish', price: 'Le 85,000', description: 'Fresh fish grilled with local spices' },
        { name: 'Beef Steak', price: 'Le 95,000', description: 'Premium beef steak with vegetables' }
      ]
    }
  ],
  events: [
    {
      title: 'Live Music Night',
      date: '2024-01-20',
      time: '7:00 PM',
      description: 'Enjoy live music performances while dining'
    }
  ],
  reviews: [
    {
      id: 1,
      author: 'John Doe',
      rating: 5,
      comment: 'Excellent food and service! Highly recommended.',
      date: '2024-01-10'
    },
    {
      id: 2,
      author: 'Jane Smith',
      rating: 4,
      comment: 'Great atmosphere and delicious food. Will visit again.',
      date: '2024-01-08'
    }
  ],
  bookingEnabled: true,
  featured: true,
  verified: true
};

export default function ListingView() {
  const { slug } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* CORE INFO Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-2xl">CORE INFO</CardTitle>
            <div className="flex gap-1">
              {mockListing.featured && (
                <Badge variant="default">Featured</Badge>
              )}
              {mockListing.verified && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {mockListing.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {mockListing.tagline}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {mockListing.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{mockListing.priceRange}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{mockListing.chiefdom}, {mockListing.district}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Business Hours</h3>
                {Object.entries(mockListing.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span>{day}</span>
                    <span className="text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Image Gallery</h3>
                <div className="relative">
                  <img
                    src={mockListing.images[selectedImageIndex]}
                    alt={mockListing.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/80">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/80">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {mockListing.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-16 h-16 rounded border-2 ${
                        index === selectedImageIndex ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={mockListing.images[index]}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MEDIA Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">MEDIA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Image Gallery</h3>
              <div className="grid grid-cols-3 gap-2">
                {mockListing.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Video</h3>
              <div className="relative">
                <img
                  src={mockListing.videos[0]}
                  alt="Video thumbnail"
                  className="w-full h-32 object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTENT & ENGAGEMENT Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">CONTENT & ENGAGEMENT</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="faqs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="deals">Deals / Coupons</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="faqs" className="space-y-4">
              {mockListing.faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="announcements" className="space-y-4">
              {mockListing.announcements.map((announcement, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{announcement.title}</h4>
                  <p className="text-muted-foreground mb-2">{announcement.content}</p>
                  <span className="text-sm text-muted-foreground">{announcement.date}</span>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="deals" className="space-y-4">
              {mockListing.deals.map((deal, index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">{deal.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-2">{deal.description}</p>
                  <span className="text-sm text-green-600">Valid until: {deal.validUntil}</span>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="menu" className="space-y-6">
              {mockListing.menu.map((category, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg mb-4">{category.category}</h4>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="font-semibold text-primary">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  {index < mockListing.menu.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* COMMUNICATION Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">COMMUNICATION</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-1">Website</h4>
              <a href={mockListing.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                Visit Website
              </a>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-1">Lead Form</h4>
              <Button size="sm" variant="outline">Contact Us</Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-1">Inbox</h4>
              <Button size="sm" variant="outline">Message</Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold mb-1">Social Links</h4>
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline">FB</Button>
                <Button size="sm" variant="outline">IG</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INTERACTION Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">INTERACTION</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Reviews & Ratings</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{mockListing.rating}</div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= mockListing.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {mockListing.reviewCount} reviews
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {mockListing.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Booking</h3>
              {mockListing.bookingEnabled ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Book an Appointment</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule your visit or reservation easily
                    </p>
                    <Button className="w-full">Book Now</Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Booking not available for this listing</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MONETIZATION Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">MONETIZATION (ADMIN)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-muted-foreground">Ad Space</div>
            </div>
            <h4 className="font-semibold mb-2">Ad Campaigns</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Promote your business with targeted advertising
            </p>
            <Button variant="outline">Learn More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}