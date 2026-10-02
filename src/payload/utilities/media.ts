import { muxURLs } from "@simmalugnt-se/payload-mux/frontend";
import type { Image, Video } from "@/payload-types";

/**
 * An upload value as Payload returns it: an image or a video, populated or only an id. A field
 * that takes both collections returns `{ relationTo, value }`.
 */
export type PayloadMediaValue =
  | Image
  | Video
  | number
  | string
  | { relationTo: "images"; value: Image | number | string }
  | { relationTo: "videos"; value: Video | number | string }
  | null
  | undefined;

type ResolvedImageMedia = {
  alt: string;
  height?: number;
  kind: "image";
  src: string;
  width?: number;
};

type ResolvedVideoMedia = {
  alt: string;
  kind: "video";
  poster?: string;
  src: string;
  sources?: {
    src: string;
    type: string;
  }[];
};

export type ResolvedPayloadMedia = ResolvedImageMedia | ResolvedVideoMedia;

type PreferredSize = "full" | "card" | "thumbnail";

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** The populated document behind a value, or null when it is only an id. */
function documentOf(value: PayloadMediaValue): Image | Video | null {
  if (!value || typeof value !== "object") return null;
  if ("relationTo" in value) {
    return typeof value.value === "object" && value.value !== null ? value.value : null;
  }
  return "id" in value ? value : null;
}

function isVideo(doc: Image | Video): doc is Video {
  return "playbackId" in doc || "assetId" in doc;
}

export function getMediaImageURL(value: PayloadMediaValue, preferredSize: PreferredSize = "full") {
  const image = documentOf(value);
  if (!image || isVideo(image)) {
    return null;
  }

  if (preferredSize === "full") {
    return asTrimmedString(image.url) || null;
  }

  const sizeMap = {
    card: image.sizes?.card?.url,
    thumbnail: image.sizes?.thumbnail?.url,
  };

  return asTrimmedString(sizeMap[preferredSize]) || asTrimmedString(image.url) || null;
}

export function getMediaImageDimensions(
  value: PayloadMediaValue,
  preferredSize: PreferredSize = "full",
) {
  const image = documentOf(value);
  if (!image || isVideo(image)) {
    return null;
  }

  const own = {
    height: typeof image.height === "number" ? image.height : undefined,
    width: typeof image.width === "number" ? image.width : undefined,
  };
  if (preferredSize === "full") {
    return own;
  }

  const size = { card: image.sizes?.card, thumbnail: image.sizes?.thumbnail }[preferredSize];
  return asTrimmedString(size?.url)
    ? {
        height: typeof size?.height === "number" ? size.height : undefined,
        width: typeof size?.width === "number" ? size.width : undefined,
      }
    : own;
}

/**
 * A video plays as its MP4 where it has one, which every browser plays in a plain `<video>`, and
 * as HLS otherwise (Safari). The poster is the chosen image, else a frame from Mux.
 */
function resolveVideo(video: Video): ResolvedVideoMedia | null {
  const playbackId = asTrimmedString(video.playbackId);
  if (!playbackId || video.status !== "ready") {
    return null;
  }
  const hls = muxURLs.hls(playbackId);
  const mp4 = asTrimmedString(video.mp4);
  const poster =
    getMediaImageURL(video.poster as PayloadMediaValue) ??
    muxURLs.poster(playbackId, video.posterTime);
  return {
    alt: asTrimmedString(video.description),
    kind: "video",
    poster,
    sources: [
      ...(mp4 ? [{ src: muxURLs.mp4(playbackId, mp4), type: "video/mp4" }] : []),
      { src: hls, type: "application/x-mpegURL" },
    ],
    src: hls,
  };
}

export function resolvePayloadMedia(
  value: PayloadMediaValue,
  preferredSize: PreferredSize = "full",
): ResolvedPayloadMedia | null {
  const doc = documentOf(value);
  if (!doc) {
    return null;
  }
  if (isVideo(doc)) {
    return resolveVideo(doc);
  }

  const imageURL = getMediaImageURL(doc, preferredSize);
  if (!imageURL) {
    return null;
  }

  return {
    alt: asTrimmedString(doc.alt),
    ...getMediaImageDimensions(doc, preferredSize),
    kind: "image",
    src: imageURL,
  };
}
