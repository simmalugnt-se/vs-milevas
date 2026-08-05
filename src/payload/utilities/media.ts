import type { Media } from "@/payload-types";

export type PayloadMediaValue = Media | number | string | null | undefined;

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

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isMediaObject(value: PayloadMediaValue): value is Media {
  return typeof value === "object" && value !== null && "id" in value;
}

export function getMediaObject(value: PayloadMediaValue) {
  return isMediaObject(value) ? value : null;
}

export function getMediaAlt(value: PayloadMediaValue) {
  const media = getMediaObject(value);
  return media ? asTrimmedString(media.alt) : "";
}

export function getMediaImageURL(
  value: PayloadMediaValue,
  preferredSize: "full" | "card" | "thumbnail" = "full",
) {
  const media = getMediaObject(value);

  if (!media) {
    return null;
  }

  if (preferredSize === "full") {
    return asTrimmedString(media.url) || null;
  }

  const sizeMap = {
    card: media.sizes?.card?.url,
    thumbnail: media.sizes?.thumbnail?.url,
  };

  const preferredUrl = sizeMap[preferredSize];

  return asTrimmedString(preferredUrl) || asTrimmedString(media.url) || null;
}

export function getMediaImageDimensions(
  value: PayloadMediaValue,
  preferredSize: "full" | "card" | "thumbnail" = "full",
) {
  const media = getMediaObject(value);

  if (!media) {
    return null;
  }

  if (preferredSize === "full") {
    return {
      height: typeof media.height === "number" ? media.height : undefined,
      width: typeof media.width === "number" ? media.width : undefined,
    };
  }

  const sizeMap = {
    card: media.sizes?.card,
    thumbnail: media.sizes?.thumbnail,
  };

  const preferredSizeValue = sizeMap[preferredSize];
  const preferredUrl = asTrimmedString(preferredSizeValue?.url);

  if (preferredUrl) {
    return {
      height:
        typeof preferredSizeValue?.height === "number" ? preferredSizeValue.height : undefined,
      width: typeof preferredSizeValue?.width === "number" ? preferredSizeValue.width : undefined,
    };
  }

  return {
    height: typeof media.height === "number" ? media.height : undefined,
    width: typeof media.width === "number" ? media.width : undefined,
  };
}

export function getMediaPlaybackId(value: PayloadMediaValue) {
  const media = getMediaObject(value);
  const playbackId = media?.muxVideo?.videoData?.playback_ids?.[0]?.id;

  return asTrimmedString(playbackId) || null;
}

export function getMediaVideoURL(value: PayloadMediaValue) {
  const playbackId = getMediaPlaybackId(value);
  return playbackId
    ? `https://stream.mux.com/${playbackId}.m3u8?min_resolution=720p&rendition_order=desc`
    : null;
}

function getMuxStaticRenditionName(value: PayloadMediaValue) {
  const media = getMediaObject(value);
  const staticRenditions = media?.muxVideo?.videoData?.static_renditions;
  const files = (() => {
    if (Array.isArray(staticRenditions)) {
      return staticRenditions;
    }

    if (
      staticRenditions &&
      typeof staticRenditions === "object" &&
      "files" in staticRenditions &&
      Array.isArray(staticRenditions.files)
    ) {
      return staticRenditions.files as Array<{ name?: string; status?: string }>;
    }

    return [];
  })();
  const preferredNames = ["highest.mp4", "high.mp4", "1080p.mp4", "720p.mp4", "medium.mp4"];

  for (const preferredName of preferredNames) {
    const rendition = files.find(
      (file: { name?: string; status?: string }) =>
        file?.name === preferredName && (!file.status || file.status === "ready"),
    );

    if (rendition?.name) {
      return rendition.name;
    }
  }

  return null;
}

export function getMediaVideoMP4URL(value: PayloadMediaValue) {
  const playbackId = getMediaPlaybackId(value);

  if (!playbackId) {
    return null;
  }

  const staticRenditionName = getMuxStaticRenditionName(value);

  if (staticRenditionName) {
    return `https://stream.mux.com/${playbackId}/${staticRenditionName}`;
  }

  const media = getMediaObject(value);
  const mp4Support = asTrimmedString(media?.muxVideo?.videoData?.mp4_support);

  return mp4Support && mp4Support !== "none"
    ? `https://stream.mux.com/${playbackId}/high.mp4`
    : null;
}

export function getMediaPosterURL(value: PayloadMediaValue) {
  const playbackId = getMediaPlaybackId(value);
  return playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.png?width=1600&fit_mode=preserve&time=1`
    : null;
}

export function resolvePayloadMedia(
  value: PayloadMediaValue,
  preferredSize: "full" | "card" | "thumbnail" = "full",
): ResolvedPayloadMedia | null {
  const alt = getMediaAlt(value);
  const videoURL = getMediaVideoURL(value);
  const videoMP4URL = getMediaVideoMP4URL(value);

  if (videoURL) {
    return {
      alt,
      kind: "video",
      poster: getMediaPosterURL(value) ?? undefined,
      sources: [
        ...(videoMP4URL ? [{ src: videoMP4URL, type: "video/mp4" }] : []),
        { src: videoURL, type: "application/x-mpegURL" },
      ],
      src: videoURL,
    };
  }

  const imageURL = getMediaImageURL(value, preferredSize);

  if (!imageURL) {
    return null;
  }

  return {
    alt,
    ...getMediaImageDimensions(value, preferredSize),
    kind: "image",
    src: imageURL,
  };
}
