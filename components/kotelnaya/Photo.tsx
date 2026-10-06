import Image from "next/image";

import { PHOTOS } from "@/lib/kotelnaya/photos";

/**
 * One of the bakery's photographs, if it exists yet. A frame that has not
 * been made is not drawn as a grey box: the caller decides what stands in
 * its place, usually type.
 */
export function Photo({
  slug,
  alt,
  sizes,
  priority = false,
  className,
}: {
  slug: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const p = PHOTOS[slug];
  if (!p) return null;
  return (
    <Image
      src={`/work/kotelnaya/photos/${slug}.jpg`}
      alt={alt}
      width={p.w}
      height={p.h}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

export const hasPhoto = (slug: string) => Boolean(PHOTOS[slug]);
