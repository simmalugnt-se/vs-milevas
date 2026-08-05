// Complete Mux Asset interface based on your actual data structure
export interface MuxAsset {
  id: string;
  status: string;
  duration?: number;
  aspect_ratio?: string;
  created_at: string;
  video_quality?: string;
  upload_id?: string;
  tracks?: Array<{
    type: string;
    max_width?: number;
    max_height?: number;
    max_frame_rate?: number;
    id: string;
    duration?: number;
  }>;
  resolution_tier?: string;
  progress?: {
    state: string;
    progress: number;
  };
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
  mp4_support?: string;
  meta?: {
    title?: string;
    description?: string;
  };
  max_stored_resolution?: string;
  max_stored_frame_rate?: number;
  max_resolution_tier?: string;
  master_access?: string;
  ingest_type?: string;
  encoding_tier?: string;
}

export interface MuxVideoData {
  selectedVideoId: string | null;
  videoData: MuxAsset | null;
}
