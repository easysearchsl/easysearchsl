import { Listing, BusinessHours, DayHours } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, PlayCircle } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  listing: Listing;
}

function isYouTube(url: string) {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/i.test(url);
}

function toYouTubeEmbed(url: string) {
  // Extract video ID from common patterns
  const idMatch = url.match(/[?&]v=([^&#]+)|youtu\.be\/([^&#/]+)|embed\/([^&#/]+)/);
  const id = idMatch?.[1] || idMatch?.[2] || idMatch?.[3];
  return id ? `https://www.youtube.com/embed/${id}` : undefined;
}

function isVideoFile(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

const formatDayHours = (hours: DayHours) => {
  if (!hours) return '—';
  if (hours.closed) return 'DAY OFF';
  if (hours.open && hours.close) return `${hours.open} - ${hours.close}`;
  return 'Hours not available';
};

const dayOrder: (keyof BusinessHours)[] = [
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
];

function getTodayKey(): keyof BusinessHours {
  const idx = new Date().getDay(); // 0=Sun..6=Sat
  const map: Record<number, keyof BusinessHours> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
  };
  return map[idx] || 'monday';
}

export function ListingVideoHoursBar({ listing }: Props) {
  const primaryVideo = listing.videos?.[0];
  const businessHours: BusinessHours | undefined = useMemo(() => {
    const raw = listing.business_hours as unknown as string | BusinessHours;
    if (!raw) return undefined;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) as BusinessHours; } catch { return undefined; }
    }
    return raw as BusinessHours;
  }, [listing.business_hours]);

  const todayKey = getTodayKey();
  const todayLabel = todayKey.charAt(0).toUpperCase() + todayKey.slice(1);
  const todayHours = businessHours ? businessHours[todayKey] : undefined;
  const todayText = todayHours ? formatDayHours(todayHours) : '—';
  const isDayOff = todayHours?.closed === true;

  const renderVideo = () => {
    if (!primaryVideo) return null;
    if (isYouTube(primaryVideo)) {
      const src = toYouTubeEmbed(primaryVideo) || primaryVideo;
      return (
        <div className="relative w-full" style={{paddingTop: '56.25%'}}>
          <iframe
            src={src}
            className="absolute inset-0 h-full w-full rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={listing.title + ' video'}
          />
        </div>
      );
    }
    if (isVideoFile(primaryVideo)) {
      return (
        <video className="w-full h-auto rounded-md" controls>
          <source src={primaryVideo} />
          Your browser does not support the video tag.
        </video>
      );
    }
    // Fallback: try generic iframe
    return (
      <div className="relative w-full" style={{paddingTop: '56.25%'}}>
        <iframe
          src={primaryVideo}
          className="absolute inset-0 h-full w-full rounded-md"
          allowFullScreen
          title={listing.title + ' video'}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="w-full overflow-x-auto">
        <div className="flex items-center whitespace-nowrap rounded-md border bg-white px-3 py-2 gap-3">
          {/* Left: label */}
          <div className="flex items-center gap-2 min-w-0">
            <PlayCircle className="h-4 w-4 text-primary" />
            <span className="truncate text-sm">
              Checkout <span className="font-semibold">{listing.title}</span>
            </span>
          </div>

          {/* Watch Video */}
          {primaryVideo ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Watch Video</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{listing.title} — Video</DialogTitle>
                </DialogHeader>
                {renderVideo()}
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" size="sm" disabled>Watch Video</Button>
          )}

          {/* Divider to push right side */}
          <div className="ml-auto h-5 w-px bg-border" />

          {/* Right: today + timings */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{todayLabel}</span>
            <span className={`text-xs md:text-sm font-semibold ${isDayOff ? 'text-red-600' : 'text-foreground'}`}>{todayText}</span>
            {businessHours && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground px-2">
                    + Show All Timings
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-3 w-64">
                  <div className="space-y-1 text-sm">
                    {dayOrder.map((k) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="capitalize text-muted-foreground">{k}</span>
                        <span className={`font-medium ${businessHours[k]?.closed ? 'text-red-600' : ''}`}>
                          {formatDayHours(businessHours[k])}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
