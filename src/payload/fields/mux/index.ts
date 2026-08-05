import type { JSONField } from "payload";

type MuxFieldOptions = {
  localized?: boolean;
};

export const muxField = ({ localized = false }: MuxFieldOptions = {}) => {
  const muxFieldConfig: JSONField = {
    name: "muxVideo",
    type: "json" as const,
    label: "Mux Video",
    localized,
    admin: {
      components: {
        Field: "/payload/fields/mux/MuxComponent#MuxComponent",
      },
    },
    typescriptSchema: [
      ({ jsonSchema }) => ({
        ...jsonSchema,
        type: "object",
        properties: {
          selectedVideoId: {
            type: ["string", "null"],
          },
          videoData: {
            type: ["object", "null"],
            properties: {
              id: { type: "string" },
              status: { type: "string" },
              duration: { type: "number" },
              aspect_ratio: { type: "string" },
              created_at: { type: "string" },
              video_quality: { type: "string" },
              upload_id: { type: "string" },
              tracks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    max_width: { type: "number" },
                    max_height: { type: "number" },
                    max_frame_rate: { type: "number" },
                    id: { type: "string" },
                    duration: { type: "number" },
                  },
                  required: ["type", "id"],
                },
              },
              resolution_tier: { type: "string" },
              progress: {
                type: "object",
                properties: {
                  state: { type: "string" },
                  progress: { type: "number" },
                },
                required: ["state", "progress"],
              },
              playback_ids: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    policy: { type: "string" },
                  },
                  required: ["id", "policy"],
                },
              },
              mp4_support: { type: "string" },
              meta: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
              max_stored_resolution: { type: "string" },
              max_stored_frame_rate: { type: "number" },
              max_resolution_tier: { type: "string" },
              master_access: { type: "string" },
              ingest_type: { type: "string" },
              encoding_tier: { type: "string" },
            },
            required: ["id", "status", "created_at"],
          },
        },
        required: ["selectedVideoId", "videoData"],
        additionalProperties: false,
      }),
    ],
  };

  return muxFieldConfig;
};
