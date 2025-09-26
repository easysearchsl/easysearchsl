
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Image as ImageIcon } from 'lucide-react';

interface MediaSectionProps {
  listing: any;
}

export function MediaSection({ listing }: MediaSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ImageIcon className="h-6 w-6" />
          MEDIA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Image Gallery</h3>
            <div className="grid grid-cols-3 gap-2">
              {listing.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Videos</h3>
            <div className="space-y-2">
              {listing.videos.map((video: string, index: number) => (
                <div key={index} className="relative">
                  <img
                    src={video}
                    alt="Video thumbnail"
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
