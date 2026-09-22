"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AboutGallery({ images }: { images: { src: string; alt: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActive(clamped);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex aspect-[4/5] overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div key={img.src} className="relative w-full h-full shrink-0 snap-start">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-ivory/90 text-charcoal transition-opacity hover:bg-ivory disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(active + 1)}
            disabled={active === images.length - 1}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-ivory/90 text-charcoal transition-opacity hover:bg-ivory disabled:opacity-0"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={active === i}
                className={`h-1.5 rounded-full transition-all ${
                  active === i ? "w-5 bg-ivory" : "w-1.5 bg-ivory/50 hover:bg-ivory/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
