"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoveAnnotation } from "@/types/chess";
import { useStudyStore } from "@/store/study-store";

interface NodeAnnotationModalProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
}

export function NodeAnnotationModal({ isOpen, nodeId, onClose }: NodeAnnotationModalProps) {
  const { study, updateAnnotation, updateComment, updateVideoTimestamp } = useStudyStore();

  const [annotation, setAnnotation] = useState<MoveAnnotation>("");
  const [comment, setComment] = useState("");
  const [timestampStr, setTimestampStr] = useState("");

  const node = nodeId && study?.nodes ? study.nodes[nodeId] : null;

  useEffect(() => {
    if (node) {
      setAnnotation(node.annotation || "");
      setComment(node.comment || "");
      if (node.videoTimestamp !== undefined) {
        const mins = Math.floor(node.videoTimestamp / 60);
        const secs = node.videoTimestamp % 60;
        setTimestampStr(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      } else {
        setTimestampStr("");
      }
    }
  }, [node]);

  const handleSave = () => {
    if (!nodeId) return;

    updateAnnotation(nodeId, annotation);
    updateComment(nodeId, comment);

    // Parse timestamp (mm:ss or seconds)
    if (timestampStr.trim()) {
      let totalSecs = 0;
      if (timestampStr.includes(":")) {
        const parts = timestampStr.split(":");
        totalSecs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        totalSecs = parseInt(timestampStr, 10);
      }
      if (!isNaN(totalSecs)) {
        updateVideoTimestamp(nodeId, totalSecs);
      }
    }

    onClose();
  };

  const annotationsList: Array<{ label: string; value: MoveAnnotation; desc: string }> = [
    { label: "None", value: "", desc: "Normal move" },
    { label: "!", value: "!", desc: "Good move" },
    { label: "!!", value: "!!", desc: "Brilliant move" },
    { label: "!?", value: "!?", desc: "Interesting move" },
    { label: "?!", value: "?!", desc: "Dubious move" },
    { label: "?", value: "?", desc: "Mistake" },
    { label: "??", value: "??", desc: "Blunder" },
  ];

  if (!node) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Annotate ${node.turn === "w" ? `${node.moveNumber}. ` : `${node.moveNumber}... `}${node.san}`}
      description="Add move explanations, strategic plans, and video timestamp references."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {/* NAG Annotation Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
            Move Symbol (NAG)
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {annotationsList.map((ann) => (
              <button
                key={ann.label}
                type="button"
                onClick={() => setAnnotation(ann.value)}
                className={`py-1.5 px-2 text-xs font-mono font-bold rounded-md border transition-all ${
                  annotation === ann.value
                    ? "bg-amber-500 text-neutral-950 border-amber-400"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
                }`}
                title={ann.desc}
              >
                {ann.label}
              </button>
            ))}
          </div>
        </div>

        {/* Move Explanation / Strategic Ideas */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Explanation & Tactical Notes
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Explain why this move is played, key opponent threats, pawn structures, or tactical traps..."
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
          />
        </div>

        {/* Video Timestamp Reference */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Video Timestamp (Optional, e.g. 04:32 or 272)
          </label>
          <input
            type="text"
            value={timestampStr}
            onChange={(e) => setTimestampStr(e.target.value)}
            placeholder="04:32"
            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            Save Annotation
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
