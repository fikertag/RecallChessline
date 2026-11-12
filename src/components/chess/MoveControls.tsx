"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Trash2,
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
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card text-card-foreground border border-border rounded-xl shadow-xs">
      {/* Navigation cluster */}
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={goToStart}
          title="Go to Start (Home)"
          className="h-8 w-8"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={goBack}
          disabled={!currentNodeId}
          title="Previous Move (←)"
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={goForward}
          title="Next Move (→)"
          className="h-8 w-8"
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
          className="h-8 w-8"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
          className="h-8 w-8"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 text-destructive" />
          )}
        </Button>

        {/* Delete branch button */}
        {currentNodeId ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDeleteOpen(true)}
            title="Delete this move & branch"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
            <div className="p-3 bg-muted rounded-lg border border-border text-xs text-foreground">
              <span className="font-semibold text-primary">Move to delete:</span>{" "}
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
