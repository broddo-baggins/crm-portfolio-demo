import { cn } from "@/lib/utils";

interface ProductShotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  /** Which part of the capture stays in view when the frame crops it. */
  position?: string;
}

/** A real capture of the running app, in a quiet 1 px frame with a window bar. */
export function ProductShot({ src, alt, width, height, priority = false, className, position = "top left" }: ProductShotProps) {
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-border bg-surface shadow-float", className)}>
      <div className="flex h-7 items-center gap-1.5 border-b border-border bg-sunken px-3" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-ink-300" />
        <span className="h-2 w-2 rounded-full bg-ink-200" />
        <span className="h-2 w-2 rounded-full bg-ink-200" />
      </div>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        data-priority={priority || undefined}
        decoding="async"
        className="block h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </figure>
  );
}

export default ProductShot;
