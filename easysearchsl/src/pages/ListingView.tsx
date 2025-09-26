
import { useParams } from 'react-router-dom';
import { CoreInfoSection } from '@/components/listings/single/CoreInfoSection';
import { MediaSection } from '@/components/listings/single/MediaSection';
import { ContentEngagementSection } from '@/components/listings/single/ContentEngagementSection';
import { CommunicationSection } from '@/components/listings/single/CommunicationSection';
import { InteractionSection } from '@/components/listings/single/InteractionSection';
import { MonetizationSection } from '@/components/listings/single/MonetizationSection';

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
    'monday': '9:00 AM—6:00 PM',
    'tuesday': '9:00 AM—6:00 PM',
    'wednesday': '9:00 AM—6:00 PM',
    'thursday': '9:00 AM—6:00 PM',
    'friday': '9:00 AM—6:00 PM',
    'saturday': '10:00 AM—8:00 PM',
    'sunday': 'Closed'
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

  return (
    <div className="container mx-auto px-4 py-8">
      <CoreInfoSection listing={mockListing} />
      <MediaSection listing={mockListing} />
      <ContentEngagementSection listing={mockListing} />
      <CommunicationSection listing={mockListing} />
      <InteractionSection listing={mockListing} />
      <MonetizationSection listing={mockListing} />
    </div>
  );
}
