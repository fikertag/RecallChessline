"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";

interface VideoReferenceModalProps {
  isOpen: boolean;
  videoUrl?: string;
  initialSeconds?: number;
  onClose: () => void;
}

export function VideoReferenceModal({
  isOpen,
  videoUrl,
  initialSeconds = 0,
  onClose,
}: VideoReferenceModalProps) {
  if (!videoUrl) return null;

  // Extract YouTube ID
  let videoId = "";
  try {
    if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (videoUrl.includes("youtube.com/watch")) {
      const url = new URL(videoUrl);
      videoId = url.searchParams.get("v") || "";
    }
  } catch {
    //
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?start=${initialSeconds}&autoplay=1`
    : videoUrl;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Opening Video Reference"
      description="Study the theory, master commentary, and tactical motifs directly alongside your repertoire."
      maxWidth="xl"
    >
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mt-2">
        {videoId ? (
          <iframe
            src={embedUrl}
            title="Chess Opening Masterclass"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            Invalid YouTube URL provided.
          </div>
        )}
      </div>
    </Dialog>
  );
}

