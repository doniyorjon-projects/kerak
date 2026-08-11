import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_THRESHOLD = 50;

export function ImageLightbox({ photos, initialIndex, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setIndex((i) => (i + 1) % photos.length);

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsGesturing(true);

    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      pinchStart.current = { distance: distance(p1, p2), scale };
      panStart.current = null;
      swipeStart.current = null;
    } else if (pointers.current.size === 1) {
      if (scale > 1) {
        panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
      } else {
        swipeStart.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [p1, p2] = [...pointers.current.values()];
      const ratio = distance(p1, p2) / pinchStart.current.distance;
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStart.current.scale * ratio)));
    } else if (pointers.current.size === 1 && scale > 1 && panStart.current) {
      setTranslate({
        x: panStart.current.tx + (e.clientX - panStart.current.x),
        y: panStart.current.ty + (e.clientY - panStart.current.y),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointers.current.size === 1 && scale === 1 && swipeStart.current) {
      const dx = e.clientX - swipeStart.current.x;
      const dy = e.clientY - swipeStart.current.y;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }

    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      panStart.current = null;
      swipeStart.current = null;
      setIsGesturing(false);
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(DOUBLE_TAP_SCALE);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-black motion-safe:animate-[fade-in_0.18s_ease-out]">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-white/80">
          {photos.length > 1 ? `${index + 1}/${photos.length}` : ""}
        </span>
        <button
          onClick={onClose}
          aria-label="Yopish"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative flex flex-1 touch-none select-none items-center justify-center overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={photos[index]}
          className="max-h-full max-w-full object-contain"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isGesturing ? "none" : "transform 150ms ease-out",
          }}
          draggable={false}
        />

        {photos.length > 1 && scale === 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Oldingi rasm"
              className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Keyingi rasm"
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
