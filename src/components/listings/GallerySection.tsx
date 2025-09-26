import { useCallback, useEffect, useState } from "react";
import { Listing } from "@/types";
import { FaImages } from "react-icons/fa";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SectionShell } from "@/components/listings/SectionShell";

interface GallerySectionProps {
  listing: Listing;
  maxImages?: number; // optional cap for performance
}

export function GallerySection({ listing, maxImages = 12 }: GallerySectionProps) {
  const images = (Array.isArray(listing.images) ? listing.images : []).filter(Boolean);
  const display = images.slice(0, maxImages);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openAt = (i: number) => {
    setSelectedIndex(i);
    setOpen(true);
  };
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setSelectedIndex((i) => (i + 1) % display.length), [display.length]);
  const prev = useCallback(() => setSelectedIndex((i) => (i - 1 + display.length) % display.length), [display.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  if (!display.length) return null;

  return (
    <SectionShell title="Gallery" Icon={FaImages} accent>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {display.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            onClick={() => openAt(idx)}
            className="group block overflow-hidden rounded-lg border bg-background hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            title={listing.title}
          >
            <div className="relative w-full" style={{ paddingBottom: "66%" }}>
              <img
                src={src}
                alt={listing.title || `Gallery image ${idx + 1}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
            </div>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{listing.title} - Gallery</DialogTitle>
          <div className="relative bg-black">
            <img
              src={display[selectedIndex]}
              alt={listing.title || `Image ${selectedIndex + 1}`}
              className="mx-auto h-[70vh] w-auto max-w-full object-contain"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              sizes="100vw"
            />

            {display.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                  onClick={prev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  aria-label="Next"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                  onClick={next}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <button
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
              onClick={close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SectionShell>
  );
}
