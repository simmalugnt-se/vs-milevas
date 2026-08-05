import type { CollectionBeforeValidateHook } from "payload";
import { ValidationError } from "payload";
import { formatSlug } from "@/payload/utilities/formatSlug";
import type { Media } from "@/payload-types";

type MuxVideoInfo = {
  assetId: string;
  title: string | null;
};

function getTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getMuxVideoInfo(value: unknown): MuxVideoInfo | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const videoData =
    "videoData" in value && value.videoData && typeof value.videoData === "object"
      ? value.videoData
      : null;
  const videoDataId = videoData && "id" in videoData ? getTrimmedString(videoData.id) : "";
  const selectedVideoId = "selectedVideoId" in value ? getTrimmedString(value.selectedVideoId) : "";
  const assetId = videoDataId || selectedVideoId;

  if (assetId) {
    const meta =
      videoData && "meta" in videoData && videoData.meta && typeof videoData.meta === "object"
        ? videoData.meta
        : null;
    const title = meta && "title" in meta ? getTrimmedString(meta.title) || null : null;

    return {
      assetId,
      title,
    };
  }

  for (const childValue of Object.values(value)) {
    const muxVideoInfo = getMuxVideoInfo(childValue);

    if (muxVideoInfo) {
      return muxVideoInfo;
    }
  }

  return null;
}

function getMuxVideoFilename({ assetId, title }: MuxVideoInfo) {
  const titleSlug = title ? formatSlug(title) : "";
  const assetSuffix = assetId.slice(0, 8);

  return `${titleSlug || "mux-video"}-${assetSuffix}.mux`;
}

function hasOwnProperty(value: object, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function hasStoredUpload(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const filename = "filename" in value ? getTrimmedString(value.filename) : "";
  const url = "url" in value ? getTrimmedString(value.url) : "";
  const mimeType = "mimeType" in value ? getTrimmedString(value.mimeType) : "";
  const isImageUpload = mimeType.startsWith("image/");
  const hasFileMetadata =
    url ||
    isImageUpload ||
    ("filesize" in value && typeof value.filesize === "number") ||
    ("width" in value && typeof value.width === "number") ||
    ("height" in value && typeof value.height === "number");

  return Boolean(filename && hasFileMetadata);
}

export const validateMediaSource: CollectionBeforeValidateHook<Media> = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.file && !req.file.mimetype.startsWith("image/")) {
    throw new ValidationError(
      {
        collection: "media",
        errors: [
          {
            message: "Uploaded media files must be images. Use the Mux Video field for videos.",
            path: "file",
          },
        ],
        req,
      },
      req.t,
    );
  }

  const muxVideoValue =
    data && hasOwnProperty(data, "muxVideo") ? data.muxVideo : originalDoc?.muxVideo;
  const muxVideoInfo = getMuxVideoInfo(muxVideoValue);
  const hasUpload = Boolean(req.file || hasStoredUpload(data) || hasStoredUpload(originalDoc));

  if (!hasUpload && muxVideoInfo) {
    data = {
      ...data,
      filename:
        getTrimmedString(data?.filename ?? originalDoc?.filename) ||
        getMuxVideoFilename(muxVideoInfo),
      filesize: null,
      height: null,
      mimeType: null,
      url: null,
      width: null,
    };
  }

  if (hasUpload && muxVideoInfo) {
    throw new ValidationError(
      {
        collection: "media",
        errors: [
          {
            message: "Use either an uploaded image or a Mux video, not both.",
            path: "muxVideo",
          },
        ],
        req,
      },
      req.t,
    );
  }

  if (hasUpload || muxVideoInfo) {
    return data;
  }

  throw new ValidationError(
    {
      collection: "media",
      errors: [
        {
          message: "Upload an image or select a Mux video.",
          path: "muxVideo",
        },
      ],
      req,
    },
    req.t,
  );
};
