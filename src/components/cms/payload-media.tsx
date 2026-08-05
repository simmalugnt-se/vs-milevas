import Image from "next/image";
import type { PayloadMediaValue } from "@/payload/utilities/media";
import { resolvePayloadMedia } from "@/payload/utilities/media";

type PayloadMediaProps = {
  autoPlay?: boolean;
  className?: string;
  controls?: boolean;
  fill?: boolean;
  loop?: boolean;
  media: PayloadMediaValue;
  muted?: boolean;
  playsInline?: boolean;
  preferredSize?: "full" | "card" | "thumbnail";
  priority?: boolean;
  sizes?: string;
};

export function PayloadMedia({
  autoPlay = false,
  className,
  controls = false,
  fill = false,
  loop = false,
  media,
  muted = false,
  playsInline = false,
  preferredSize = "full",
  priority = false,
  sizes,
}: PayloadMediaProps) {
  const resolved = resolvePayloadMedia(media, preferredSize);

  if (!resolved) {
    return null;
  }

  if (resolved.kind === "video") {
    return (
      <video
        aria-label={resolved.alt || undefined}
        autoPlay={autoPlay}
        className={className}
        controls={controls}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        poster={resolved.poster}
        preload={autoPlay ? "auto" : "metadata"}
      >
        {(resolved.sources ?? [{ src: resolved.src, type: "application/x-mpegURL" }]).map(
          (source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ),
        )}
      </video>
    );
  }

  if (fill) {
    return (
      <Image
        alt={resolved.alt}
        className={className}
        fill
        priority={priority}
        sizes={sizes}
        src={resolved.src}
      />
    );
  }

  return (
    <Image
      alt={resolved.alt}
      className={className}
      height={resolved.height ?? 1200}
      priority={priority}
      sizes={sizes}
      src={resolved.src}
      width={resolved.width ?? 1600}
    />
  );
}
