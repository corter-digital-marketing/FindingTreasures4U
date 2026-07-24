"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  name,
  sold,
}: {
  images: { url: string }[];
  name: string;
  sold: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[4/5] bg-ivory-dim">
        {current ? (
          <Image
            src={current.url}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-soft text-sm">
            No image available
          </div>
        )}
        {sold && (
          <div className="absolute top-4 left-4 bg-charcoal/90 text-ivory text-[11px] tracking-[0.16em] uppercase px-3.5 py-1.5">
            Sold
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={active === i}
              className={`relative aspect-square bg-ivory-dim transition-opacity ${
                active === i
                  ? "opacity-100 ring-1 ring-charcoal"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="10vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
