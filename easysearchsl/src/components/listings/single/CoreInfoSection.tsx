
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, MapPin, Heart, Share2, Star } from 'lucide-react';
import { useState } from 'react';

interface CoreInfoSectionProps {
  listing: any;
}

export function CoreInfoSection({ listing }: CoreInfoSectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">CORE INFO</CardTitle>
          <div className="flex gap-1">
            {listing.featured && (
              <Badge variant="default">Featured</Badge>
            )}
            {listing.verified && (
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
                {listing.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {listing.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{listing.rating}</span>
                <span className="text-muted-foreground">({listing.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{listing.priceRange}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{listing.chiefdom}, {listing.district}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Business Hours
              </h3>
              {Object.entries(listing.businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="capitalize">{day}</span>
                  <span className="text-muted-foreground">{hours as string}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Gallery</h3>
              <div className="relative">
                <img
                  src={listing.images[selectedImageIndex]}
                  alt={listing.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {listing.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                      index === selectedImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
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
  );
}
