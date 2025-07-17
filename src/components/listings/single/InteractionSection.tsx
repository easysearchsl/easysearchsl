
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, User } from 'lucide-react';

interface InteractionSectionProps {
  listing: any;
}

export function InteractionSection({ listing }: InteractionSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Star className="h-6 w-6" />
          INTERACTION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Reviews & Ratings</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{listing.rating}</div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= listing.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {listing.reviewCount} reviews
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {listing.reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
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
            {listing.bookingEnabled ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Book an Appointment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule your visit or reservation easily
                  </p>
                  <Button className="w-full">
                    Book Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Booking not available for this listing</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
