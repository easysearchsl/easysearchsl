import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Mail, MapPin, Phone, Smartphone, Star } from 'lucide-react';
import { Listing, BusinessHours, DayHours } from '@/types';

interface ListingDetailsProps {
  listing: Listing;
}

const formatDayHours = (hours: DayHours) => {
  if (hours.closed) return 'Closed';
  if (hours.open && hours.close) return `${hours.open} - ${hours.close}`;
  return 'Hours not available';
};

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  const businessHours: BusinessHours = typeof listing.business_hours === 'string' 
    ? JSON.parse(listing.business_hours) 
    : listing.business_hours;
 
  // Safely derive location from either the new nested location or legacy flat fields
  const location = listing.location || {
    province: '',
    district: listing.district || '',
    chiefdom: listing.chiefdom || '',
  };
  const displayChiefdom = location.chiefdom || '—';
  const displayDistrict = location.district ? location.district.replace(' District', '') : '—';
  const displayProvince = location.province || '—';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{listing.tagline}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{listing.rating}</span>
            <span className="text-muted-foreground">({listing.review_count} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">About</h3>
            <p className="text-muted-foreground">{listing.description || 'No description available.'}</p>
          </div>

          {listing.vision_statement && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Vision Statement</h3>
              <p className="text-muted-foreground">{listing.vision_statement}</p>
            </div>
          )}

          {listing.mission_statement && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Mission Statement</h3>
              <p className="text-muted-foreground">{listing.mission_statement}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {listing.tags && listing.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Hours</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {businessHours && Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span>{formatDayHours(hours)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Contact & Location</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  {listing.full_address && <p>{listing.full_address}</p>}
                  <p className="text-sm text-muted-foreground">
                    {displayChiefdom}, {displayDistrict}, {displayProvince}
                  </p>
                </div>
              </div>
              {listing.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{listing.contact_phone}</span>
                </div>
              )}
              {listing.whatsapp_number && (
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>{listing.whatsapp_number}</span>
                </div>
              )}
              {listing.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{listing.contact_email}</span>
                </div>
              )}
              {listing.website_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a href={listing.website_url} target="_blank" rel="noreferrer" className="text-secondary hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
