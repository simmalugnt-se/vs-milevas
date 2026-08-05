"use client";

import { Collapsible, TextInput, useField } from "@payloadcms/ui";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.scss";
import type { MuxAsset, MuxVideoData } from "./types";

const API_ENDPOINT = "/api/mux/get-assets";
const DELETE_API_ENDPOINT = "/api/mux/delete-asset";
const UPLOAD_API_ENDPOINT = "/api/mux/upload-asset";
const ASSET_STATUS_ENDPOINT = "/api/mux/asset-status";

// Poll interval for checking video status (5 seconds)
const POLL_INTERVAL = 5000;
// Maximum polling duration (5 minutes)
const MAX_POLL_DURATION = 5 * 60 * 1000;

const getApiDetailsMessage = (details: unknown): string | null => {
  if (typeof details !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(details) as {
      error?: { message?: string; messages?: string[] };
      message?: string;
    };

    if (Array.isArray(parsed.error?.messages) && parsed.error.messages.length > 0) {
      return parsed.error.messages.join(" ");
    }

    if (typeof parsed.error?.message === "string" && parsed.error.message.trim()) {
      return parsed.error.message;
    }

    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Keep the raw details when the API returned plain text.
  }

  const trimmed = details.trim();
  return trimmed || null;
};

const getApiErrorMessage = (
  errorData: { error?: unknown; message?: unknown; details?: unknown },
  fallback: string,
): string => {
  const primaryMessage =
    (typeof errorData.error === "string" && errorData.error.trim()) ||
    (typeof errorData.message === "string" && errorData.message.trim()) ||
    fallback;

  const detailsMessage = getApiDetailsMessage(errorData.details);
  if (!detailsMessage || primaryMessage.includes(detailsMessage)) {
    return primaryMessage;
  }

  return `${primaryMessage}: ${detailsMessage}`;
};

export const MuxComponent: React.FC = () => {
  const { value, setValue, path } = useField<MuxVideoData>();

  // State management
  const [videos, setVideos] = useState<MuxAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSearch, setVideoSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [showingDeleteConfirmId, setShowingDeleteConfirmId] = useState<string | null>(null);
  const [pollingAssets, setPollingAssets] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fetchRequestIdRef = useRef(0);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedVideosRef = useRef(false);

  const currentValue = value || { selectedVideoId: null, videoData: null };
  const selectedVideo =
    currentValue.videoData ||
    videos.find((video) => video.id === currentValue.selectedVideoId) ||
    null;
  const selectedVideoLabel = selectedVideo?.meta?.title || currentValue.selectedVideoId;

  // Fetch all videos
  const fetchVideos = useCallback(async () => {
    const requestId = ++fetchRequestIdRef.current;
    fetchAbortControllerRef.current?.abort();
    const controller = new AbortController();
    fetchAbortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      let response: Response | null = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch(API_ENDPOINT, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 499) {
          return;
        }

        if (response.ok) {
          break;
        }

        // Retry once for transient server/runtime failures.
        if (attempt === 0 && response.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          continue;
        }

        const errorData = await response
          .json()
          .catch(() => ({ error: response?.statusText || "Unknown error" }));
        throw new Error(
          `API Error (${response.status}): ${errorData.error || errorData.message || response.statusText || "Unknown error"}`,
        );
      }

      if (!response || !response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      if (requestId !== fetchRequestIdRef.current) {
        return;
      }

      setVideos(data.data || []);
      hasLoadedVideosRef.current = true;
      setError(null);
    } catch (err) {
      if (requestId !== fetchRequestIdRef.current) {
        return;
      }

      if (
        controller.signal.aborted ||
        (err instanceof Error &&
          (err.name === "AbortError" ||
            err.name === "ResponseAborted" ||
            err.message.includes("aborted")))
      ) {
        return;
      }

      if (hasLoadedVideosRef.current) {
        console.warn("Mux video refresh failed, keeping last successful result:", err);
        return;
      }

      setError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      if (requestId === fetchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Poll a specific asset until it's ready or timeout
  const pollAssetStatus = useCallback(
    async (assetId: string) => {
      const startTime = Date.now();
      setPollingAssets((prev) => new Set(prev).add(assetId));

      const poll = async () => {
        try {
          const response = await fetch(`${ASSET_STATUS_ENDPOINT}?assetId=${assetId}`);

          if (!response.ok) {
            console.error("Failed to fetch asset status");
            setPollingAssets((prev) => {
              const next = new Set(prev);
              next.delete(assetId);
              return next;
            });
            return;
          }

          const data = await response.json();
          const asset = data.data;

          // Update the video in the list
          setVideos((prevVideos) =>
            prevVideos.map((v) => (v.id === assetId ? { ...v, ...asset } : v)),
          );

          // Update selected video if it's the one being polled
          if (currentValue.selectedVideoId === assetId) {
            setValue({
              selectedVideoId: assetId,
              videoData: asset,
            });
          }

          // Check if we should continue polling
          const isReady = asset.status === "ready";
          const isErrored = asset.status === "errored";
          const hasTimedOut = Date.now() - startTime > MAX_POLL_DURATION;

          if (isReady || isErrored || hasTimedOut) {
            setPollingAssets((prev) => {
              const next = new Set(prev);
              next.delete(assetId);
              return next;
            });

            if (isErrored) {
              setError(`Video processing failed for asset ${assetId}`);
            }
          } else {
            // Continue polling
            setTimeout(poll, POLL_INTERVAL);
          }
        } catch (err) {
          console.error("Error polling asset status:", err);
          setPollingAssets((prev) => {
            const next = new Set(prev);
            next.delete(assetId);
            return next;
          });
        }
      };

      poll();
    },
    [currentValue.selectedVideoId, setValue],
  );

  // Check for preparing videos on mount and start polling
  useEffect(() => {
    const preparingVideos = videos.filter(
      (v) => v.status === "preparing" && !pollingAssets.has(v.id),
    );

    preparingVideos.forEach((video) => {
      pollAssetStatus(video.id);
    });
  }, [videos, pollingAssets, pollAssetStatus]);

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
    return () => {
      fetchAbortControllerRef.current?.abort();
    };
  }, [fetchVideos]);

  const handleVideoSelect = (videoId: string, videoData: MuxAsset) => {
    setValue({
      selectedVideoId: videoId,
      videoData: videoData,
    });
  };

  const handleClearSelection = () => {
    setValue({
      selectedVideoId: null,
      videoData: null,
    });
  };

  const handleDeleteVideo = async (video: MuxAsset) => {
    setDeletingVideoId(video.id);
    setError(null);

    try {
      const response = await fetch(`${DELETE_API_ENDPOINT}?assetId=${video.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(`Delete failed: ${getApiErrorMessage(errorData, response.statusText)}`);
      }

      setVideos((prevVideos) => prevVideos.filter((v) => v.id !== video.id));

      if (currentValue.selectedVideoId === video.id) {
        handleClearSelection();
      }

      setShowingDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim()) {
      setError("Please select a file and enter a title");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create direct upload URL
      const uploadResponse = await fetch(UPLOAD_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoTitle,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          `Upload creation failed: ${getApiErrorMessage(errorData, uploadResponse.statusText)}`,
        );
      }

      const uploadData = await uploadResponse.json();
      const { url: uploadUrl } = uploadData.data;

      // Upload file to Mux
      const xhr = new XMLHttpRequest();

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setShowUploadSuccess(true);
            setTimeout(() => {
              setShowUploadSuccess(false);
            }, 3000);
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed due to network error"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.send(selectedFile);
      });

      // Reset upload form
      setSelectedFile(null);
      setVideoTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh videos after a short delay to allow Mux to create the asset
      // The useEffect hook will automatically start polling any preparing videos
      setTimeout(() => {
        fetchVideos();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "Unknown";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isConfigurationError = (errorMessage: string) => {
    return (
      errorMessage.includes("Missing Mux credentials") ||
      errorMessage.includes("MUX_TOKEN_ID") ||
      errorMessage.includes("MUX_TOKEN_SECRET")
    );
  };

  const getThumbnailUrl = (video: MuxAsset) => {
    if (video.playback_ids && video.playback_ids.length > 0) {
      return `https://image.mux.com/${video.playback_ids[0].id}/thumbnail.png?width=400&fit_mode=preserve&time=1`;
    }
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzAgMTQwVjg1TDIzMCAxMTIuNUwxNzAgMTQwWiIgZmlsbD0iIzk5OTk5OSIvPgo8dGV4dCB4PSIyMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBUaHVtYm5haWw8L3RleHQ+Cjwvc3ZnPgo=";
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ready":
        return "status-ready";
      case "preparing":
        return "status-preparing";
      case "errored":
        return "status-errored";
      default:
        return "status-unknown";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 100MB");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError(null);
    if (!videoTitle) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(nameWithoutExtension);
    }
  };

  const selectedHeaderThumbnailUrl = selectedVideo ? getThumbnailUrl(selectedVideo) : null;
  const normalizedSearch = videoSearch.trim().toLowerCase();
  const filteredVideos = normalizedSearch
    ? videos.filter((video) => {
        const searchFields = [
          video.meta?.title,
          video.id,
          video.status,
          video.aspect_ratio,
          formatDuration(video.duration),
        ];

        return searchFields.some((fieldValue) =>
          String(fieldValue || "")
            .toLowerCase()
            .includes(normalizedSearch),
        );
      })
    : videos;

  const headerMeta = (() => {
    if (error && isConfigurationError(error)) {
      return "Configuration required";
    }

    if (error) {
      return "Needs attention";
    }

    if (selectedVideoLabel) {
      return `Selected: ${selectedVideoLabel}`;
    }

    if (loading && videos.length === 0) {
      return "Loading videos...";
    }

    if (videos.length > 0) {
      return `${videos.length} video${videos.length === 1 ? "" : "s"} available`;
    }

    return "No video selected";
  })();

  return (
    <div className="field-type mux-field-component">
      <Collapsible
        className="mux-field-collapsible"
        initCollapsed={true}
        header={
          <div className="mux-field-header">
            <div className="mux-field-header-main">
              <div className="row-label">Mux Video</div>
              <div className="mux-field-header-meta">{headerMeta}</div>
            </div>
            {selectedVideoLabel && selectedHeaderThumbnailUrl && (
              <div className="mux-field-header-preview">
                {/* biome-ignore lint/performance/noImgElement: Admin-only Mux thumbnails come from external playback URLs outside Next image optimization. */}
                <img
                  src={selectedHeaderThumbnailUrl}
                  alt={selectedVideoLabel}
                  className="mux-field-header-thumbnail"
                />
              </div>
            )}
          </div>
        }
      >
        {/* Configuration Notice */}
        {error && isConfigurationError(error) && (
          <div className="config-notice">
            <strong>Configuration Required:</strong> Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET
            environment variables in your server configuration.
          </div>
        )}

        {/* Selected Video Display */}
        {currentValue.selectedVideoId && (
          <div className="selected-video">
            <div className="selected-video-content">
              <div>
                <strong>Selected Video:</strong>{" "}
                {selectedVideo?.meta?.title || currentValue.selectedVideoId}
                {selectedVideo && (
                  <div className="selected-video-details">
                    Duration: {formatDuration(selectedVideo.duration)} • Status:{" "}
                    {selectedVideo.status}
                    {selectedVideo.aspect_ratio && ` • Aspect Ratio: ${selectedVideo.aspect_ratio}`}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearSelection}
                className="btn-secondary clear-selection-button"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Upload New Video Section */}
        <div className="upload-section">
          <h3 className="section-title">Upload New Video</h3>

          <div className="form-group">
            <TextInput
              label="Video Title"
              path={`${path}-mux-video-title`}
              value={videoTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoTitle(e.target.value)}
              placeholder="Enter video title..."
              readOnly={uploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mux-video-file-input">
              Select Video File
            </label>
            <div className="file-picker-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary choose-file-button"
              >
                Choose file
              </button>
              <span className={`file-picker-name ${selectedFile ? "has-file" : ""}`}>
                {selectedFile ? selectedFile.name : "No file chosen"}
              </span>
              <input
                ref={fileInputRef}
                id="mux-video-file-input"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden-file-input"
              />
            </div>
            {selectedFile && (
              <div className="file-info">
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          {uploading && (
            <div className="status-message status-uploading">
              <div className="status-icon">⏳</div>
              <div>
                <strong>Uploading...</strong>
                <p>Please wait while your video is being uploaded.</p>
              </div>
            </div>
          )}

          {showUploadSuccess && !uploading && (
            <div className="status-message status-success">
              <div className="status-icon">✓</div>
              <div>
                <strong>Upload Successful!</strong>
                <p>Your video has been uploaded and is being processed.</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !videoTitle.trim()}
            className="btn-secondary upload-video-button"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </div>

        {/* Error Display */}
        {error && !isConfigurationError(error) && <div className="error-message">{error}</div>}

        {/* Browse Videos Section */}
        <div className="videos-section">
          <div className="section-header">
            <h3 className="section-title">Your Videos</h3>
            <button
              type="button"
              onClick={fetchVideos}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? "Refreshing..." : "Refresh Videos"}
            </button>
          </div>

          {(videos.length > 0 || videoSearch) && (
            <div className="videos-search">
              <TextInput
                label="Search videos"
                path={`${path}-mux-video-search`}
                value={videoSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVideoSearch(e.target.value)
                }
                placeholder="Search videos by title, ID, status..."
              />
            </div>
          )}

          {videos.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <p>
                No videos found. Upload a video above or click &quot;Refresh Videos&quot; to reload.
              </p>
            </div>
          )}

          {videos.length > 0 && filteredVideos.length === 0 && !loading && (
            <div className="empty-state">
              <p>No videos match your search.</p>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading videos...</p>
            </div>
          ) : (
            <div className="video-grid">
              {filteredVideos.map((video) => {
                const isPolling = pollingAssets.has(video.id);
                const isSelected = currentValue.selectedVideoId === video.id;
                const isShowingDeleteConfirm = showingDeleteConfirmId === video.id;

                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoSelect(video.id, video)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleVideoSelect(video.id, video);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`video-card ${isSelected ? "selected" : ""} ${isPolling ? "processing" : ""} ${isShowingDeleteConfirm ? "showing-delete-confirmation" : ""}`}
                  >
                    <div className="video-thumbnail-wrapper">
                      <div className="video-thumbnail-container">
                        {/* biome-ignore lint/performance/noImgElement: Admin-only Mux thumbnails come from external playback URLs outside Next image optimization. */}
                        <img
                          src={getThumbnailUrl(video)}
                          alt={video.meta?.title || video.id}
                          className="video-thumbnail"
                        />
                        <div className="video-duration">{formatDuration(video.duration)}</div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowingDeleteConfirmId(video.id);
                          }}
                          disabled={deletingVideoId === video.id}
                          className="delete-button"
                          aria-label="Delete video"
                        >
                          {deletingVideoId === video.id ? "..." : "×"}
                        </button>

                        {isSelected && <div className="selected-badge">✓ Selected</div>}

                        {isPolling && (
                          <div className="processing-overlay">
                            <div className="spinner-small"></div>
                            <span>Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="video-info">
                      <div className="video-title">{video.meta?.title || video.id}</div>
                      <div className="video-meta">
                        <span className={`status-badge ${getStatusBadgeClass(video.status)}`}>
                          {video.status}
                        </span>
                        {video.aspect_ratio && (
                          <span className="aspect-ratio">{video.aspect_ratio}</span>
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {isShowingDeleteConfirm && (
                      <div
                        className="delete-confirmation"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <div className="delete-confirmation-text">
                          Delete &quot;{video.meta?.title || video.id}&quot;?
                        </div>
                        <div className="delete-confirmation-buttons">
                          <button
                            type="button"
                            onClick={() => setShowingDeleteConfirmId(null)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video)}
                            disabled={deletingVideoId === video.id}
                            className="btn-danger"
                          >
                            {deletingVideoId === video.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  );
};
