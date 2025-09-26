import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar } from 'lucide-react';
import { Listing, Review } from '@/types';
import { StarRating } from '@/components/shared/StarRating';

interface InteractionSectionProps {
  listing: Listing;
}

export const InteractionSection = ({ listing }: InteractionSectionProps) => {
  const { reviews } = listing;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div id="reviews" className="md:col-span-2">
            <h4 className="font-semibold mb-2">Reviews & Ratings</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl font-bold">{listing.rating.toFixed(1)}</span>
              <div>
                <StarRating rating={listing.rating} />
                <p className="text-sm text-muted-foreground">{listing.review_count} reviews</p>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{review.user?.full_name || 'Anonymous'}</span>
                      <StarRating rating={review.rating} size={4} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Booking</h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <Calendar className="h-10 w-10 text-primary mx-auto mb-2" />
              <h5 className="font-semibold">Book an Appointment</h5>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Schedule your visit or reservation easily</p>
              <Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
