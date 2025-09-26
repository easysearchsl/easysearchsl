import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221600%22 height=%22900%22 viewBox=%220 0 1600 900%22%3E%3Crect width=%221600%22 height=%22900%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-family=%22Arial%2C sans-serif%22 font-size=%2248%22%3ENo Image%3C/text%3E%3C/svg%3E';

export interface BannerCarouselProps {
  images: string[] | undefined;
  title?: string;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ images, title }) => {
  // Always render exactly 5 slides: up to 5 real images, padded with placeholders
  const base = Array.isArray(images) && images.length > 0 ? images.slice(0, 5) : [];
  const imgs = base.length > 0
    ? [...base, ...Array(Math.max(0, 5 - base.length)).fill(FALLBACK_IMG)]
    : Array(5).fill(FALLBACK_IMG);
  const [viewportRef, embla] = useEmblaCarousel({ loop: imgs.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on('select', onSelect);
    return () => {
      embla.off('select', onSelect);
    };
  }, [embla, onSelect]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => setSelectedIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const lightboxNext = () => setSelectedIndex((i) => (i + 1) % imgs.length);

  return (
    <div className="relative w-full">
      {/* Carousel viewport */}
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex touch-pan-y select-none">
          {imgs.map((src, idx) => (
            <div key={idx} className="relative min-w-0 flex-[0_0_100%]">
              <div className="h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] w-full">
                <img
                  src={src}
                  alt={title ? `${title} image ${idx + 1}` : `Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onClick={() => openLightbox(idx)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next buttons */}
      {imgs.length > 1 && (
        <>
          <button
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {imgs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {imgs.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === selectedIndex ? 'bg-white' : 'bg-white/50'}`}
              onClick={() => embla?.scrollTo(i)}
            />
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl p-2 sm:p-4">
          <DialogTitle className="sr-only">{title || 'Image'}</DialogTitle>
          <div className="relative">
            <button
              aria-label="Close"
              className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-h-[75vh]">
              <img
                src={imgs[selectedIndex]}
                alt={title ? `${title} image ${selectedIndex + 1}` : `Image ${selectedIndex + 1}`}
                className="mx-auto max-h-[75vh] w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />

              {imgs.length > 1 && (
                <>
                  <button
                    aria-label="Previous"
                    className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                    onClick={lightboxPrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    aria-label="Next"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                    onClick={lightboxNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto">
                {imgs.map((thumb, i) => (
                  <button
                    key={i}
                    className={`h-14 w-20 overflow-hidden rounded border ${i === selectedIndex ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
