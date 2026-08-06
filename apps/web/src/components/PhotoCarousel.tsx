import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

interface PhotoCarouselProps {
  photos: string[];
  className?: string;
}

export function PhotoCarousel({ photos, className = "" }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photos.length === 0) {
    return (
      <div className={`flex h-72 w-full items-center justify-center bg-surface-secondary ${className}`}>
        <ImageOff className="h-12 w-12 text-hint" strokeWidth={1.5} />
      </div>
    );
  }

  const goPrev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className={`relative h-72 w-full overflow-hidden bg-surface-secondary ${className}`}>
      <div onClick={() => setLightboxOpen(true)} className="h-full w-full cursor-pointer">
        <img src={photos[index]} className="h-full w-full select-none object-cover" draggable={false} />
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Oldingi rasm"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Keyingi rasm"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {index + 1}/{photos.length}
          </span>
        </>
      )}

      {lightboxOpen && (
        <ImageLightbox photos={photos} initialIndex={index} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
