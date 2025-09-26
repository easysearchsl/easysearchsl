import { Card, CardContent } from '@/components/ui/card';
import { Listing } from '@/types';
import { PlayCircle } from 'lucide-react';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-family=%22Arial%2C sans-serif%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E';

interface MediaSectionProps {
  listing: Listing;
}

export const MediaSection = ({ listing }: MediaSectionProps) => {
  const { images, videos } = listing;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2">Image Gallery</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(images || []).slice(0, 3).map((image, index) => (
                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </div>
              ))}
              {(images?.length || 0) < 3 && Array.from({ length: 3 - (images?.length || 0) }).map((_, i) => (
                  <div key={`placeholder-${i}`} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Videos</h4>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {videos && videos[0] ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${new URL(videos[0]).searchParams.get('v')}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-lg w-full flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
