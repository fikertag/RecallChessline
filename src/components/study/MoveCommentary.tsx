"use client";

import React from "react";
import { useStudyStore } from "@/store/study-store";
import { Button } from "@/components/ui/button";
import { Edit3, GitFork, Lightbulb, PlayCircle } from "lucide-react";

interface MoveCommentaryProps {
  onOpenAnnotationModal?: (nodeId: string) => void;
  onOpenVideoAtTimestamp?: (seconds: number) => void;
}

export function MoveCommentary({
  onOpenAnnotationModal,
  onOpenVideoAtTimestamp,
}: MoveCommentaryProps) {
  const { study, currentNodeId, selectVariation } = useStudyStore();

  if (!study) return null;

  const currentNode = currentNodeId ? study.nodes[currentNodeId] : null;

  // Candidate continuation moves from current node
  const continuationIds = currentNodeId
    ? currentNode?.children || []
    : study.rootNodeIds;

  const candidateMoves = continuationIds
    .map((id) => study.nodes[id])
    .filter(Boolean);

  return (
    <div className="flex flex-col space-y-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      {/* Current Position Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            Active Position
          </span>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-1.5 mt-0.5">
            {currentNode ? (
              <>
                <span>
                  {currentNode.turn === "w"
                    ? `${currentNode.moveNumber}.`
                    : `${currentNode.moveNumber}...`}
                </span>
                <span className="text-amber-400">{currentNode.san}</span>
                {currentNode.annotation ? (
                  <span className="text-amber-500 font-mono font-bold">
                    {currentNode.annotation}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-neutral-300">Starting Position</span>
            )}
          </h3>
        </div>

        {currentNode && onOpenAnnotationModal ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenAnnotationModal(currentNode.id)}
            className="text-xs text-neutral-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Annotate Move
          </Button>
        ) : null}
      </div>

      {/* Move Commentary / Ideas */}
      <div className="min-h-[70px]">
        {currentNode?.comment ? (
          <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800/80 text-sm text-neutral-200 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 text-xs text-amber-500/90 font-medium mb-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Strategic Notes & Plan:
            </div>
            {currentNode.comment}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-neutral-500 bg-neutral-950/40 rounded-lg border border-dashed border-neutral-800">
            <p>No explanation notes for this move yet.</p>
            {currentNode && onOpenAnnotationModal ? (
              <button
                onClick={() => onOpenAnnotationModal(currentNode.id)}
                className="text-amber-500 hover:underline mt-1 font-medium"
              >
                + Add tactical ideas or plans
              </button>
            ) : null}
          </div>
        )}

        {/* Video reference jump pill */}
        {currentNode?.videoTimestamp !== undefined && onOpenVideoAtTimestamp ? (
          <div className="mt-2.5">
            <button
              onClick={() => onOpenVideoAtTimestamp(currentNode.videoTimestamp!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-xs text-red-300 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5 text-red-400" />
              Watch Video Reference at {Math.floor(currentNode.videoTimestamp / 60)}:
              {(currentNode.videoTimestamp % 60).toString().padStart(2, "0")}
            </button>
          </div>
        ) : null}
      </div>

      {/* Available Saved Continuations from this position */}
      <div className="pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          <GitFork className="w-3.5 h-3.5 text-amber-500" />
          <span>Saved Continuations ({candidateMoves.length}):</span>
        </div>

        {candidateMoves.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {candidateMoves.map((cand, idx) => (
              <button
                key={cand.id}
                onClick={() => selectVariation(cand.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-medium text-neutral-200 border border-neutral-700/60 transition-colors"
              >
                <span className="text-[10px] text-neutral-400">
                  {idx === 0 ? "Main:" : "Var:"}
                </span>
                <span className="font-bold text-amber-400">{cand.san}</span>
                {cand.annotation ? (
                  <span className="text-[10px] text-neutral-400 font-bold">{cand.annotation}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">
            End of this saved line. Make a move on the board to branch further!
          </p>
        )}
      </div>
    </div>
  );
}
