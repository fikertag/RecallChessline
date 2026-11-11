"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Trash2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/store/board-store";
import { useStudyStore } from "@/store/study-store";
import { Dialog } from "@/components/ui/dialog";

interface MoveControlsProps {
  onOpenAnnotationModal?: () => void;
}

export function MoveControls({ onOpenAnnotationModal }: MoveControlsProps) {
  const { toggleOrientation, soundEnabled, setSoundEnabled } = useBoardStore();
  const {
    goToStart,
    goBack,
    goForward,
    currentNodeId,
    deleteBranch,
    study,
  } = useStudyStore();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goForward();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goBack, goForward, goToStart]);

  const currentNode = currentNodeId && study?.nodes ? study.nodes[currentNodeId] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
      {/* Navigation cluster */}
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={goToStart}
          title="Go to Start (Home)"
          className="h-8 w-8 text-neutral-300"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={goBack}
          disabled={!currentNodeId}
          title="Previous Move (←)"
          className="h-8 w-8 text-neutral-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={goForward}
          title="Next Move (→)"
          className="h-8 w-8 text-neutral-300"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Board & Audio cluster */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleOrientation}
          title="Flip Board Orientation"
          className="h-8 w-8 text-neutral-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
          className="h-8 w-8 text-neutral-400 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </Button>

        {/* Delete branch button (only active when at a move) */}
        {currentNodeId ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDeleteOpen(true)}
            title="Delete this move & branch"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : null}
      </div>

      {/* Confirm branch deletion modal */}
      <Dialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Variation Branch?"
        description="Are you sure you want to delete this move and all following variations in this sub-branch?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {currentNode ? (
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs text-neutral-300">
              <span className="font-semibold text-amber-400">Move to delete:</span>{" "}
              {currentNode.turn === "w" ? `${currentNode.moveNumber}. ` : `${currentNode.moveNumber}... `}
              {currentNode.san}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (currentNodeId) {
                  deleteBranch(currentNodeId);
                }
                setConfirmDeleteOpen(false);
              }}
            >
              Delete Branch
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
