"use client";

import React from "react";
import { useStudyStore } from "@/store/study-store";
import { cn } from "@/lib/utils";
import { GitBranch, MessageSquare, Tag } from "lucide-react";

interface MoveTreeVisualizerProps {
  onOpenAnnotationModal?: (nodeId: string) => void;
}

export function MoveTreeVisualizer({ onOpenAnnotationModal }: MoveTreeVisualizerProps) {
  const { study, currentNodeId, selectVariation } = useStudyStore();

  if (!study || study.rootNodeIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-card/60 rounded-xl border border-border">
        <GitBranch className="w-8 h-8 text-muted-foreground/60 mb-2 stroke-1" />
        <p className="text-sm font-medium text-foreground">Repertoire Tree is Empty</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Make moves on the board to build your opening lines and branch into new variations.
        </p>
      </div>
    );
  }

  // Recursive component to render a tree branch
  const renderBranch = (nodeId: string, isSideVariation = false) => {
    const node = study.nodes[nodeId];
    if (!node) return null;

    const isCurrent = currentNodeId === node.id;
    const hasChildren = node.children.length > 0;
    const mainChildId = hasChildren ? node.children[0] : null;
    const sideVariations = hasChildren ? node.children.slice(1) : [];

    return (
      <div key={node.id} className="relative flex flex-col">
        {/* Node move pill */}
        <div className="flex items-center gap-1.5 py-1">
          <button
            onClick={() => selectVariation(node.id)}
            className={cn(
              "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all text-left",
              isCurrent
                ? "bg-amber-500 text-neutral-950 font-bold shadow-xs ring-2 ring-amber-400/50"
                : "bg-secondary text-secondary-foreground hover:bg-muted border border-border"
            )}
          >
            {/* Move number label */}
            <span
              className={cn(
                "text-[10px]",
                isCurrent ? "text-neutral-900 font-semibold" : "text-muted-foreground"
              )}
            >
              {node.turn === "w" ? `${node.moveNumber}.` : `${node.moveNumber}...`}
            </span>

            {/* SAN notation */}
            <span className="font-semibold">{node.san}</span>

            {/* NAG annotation (!, ?, etc.) */}
            {node.annotation ? (
              <span
                className={cn(
                  "font-bold text-[11px]",
                  isCurrent ? "text-neutral-950" : "text-amber-500"
                )}
              >
                {node.annotation}
              </span>
            ) : null}

            {/* Comment indicator */}
            {node.comment ? (
              <MessageSquare
                className={cn(
                  "w-3 h-3 ml-0.5",
                  isCurrent ? "text-neutral-900" : "text-muted-foreground"
                )}
              />
            ) : null}
          </button>

          {/* Quick Annotation trigger button */}
          {onOpenAnnotationModal ? (
            <button
              onClick={() => onOpenAnnotationModal(node.id)}
              title="Add explanation / notation"
              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <Tag className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Display brief inline note if active */}
        {node.comment && isCurrent ? (
          <div className="my-1.5 p-2 rounded-lg bg-muted/80 border-l-2 border-primary text-xs text-foreground font-sans">
            <p className="italic">{node.comment}</p>
          </div>
        ) : null}

        {/* Side variations (branches) */}
        {sideVariations.length > 0 ? (
          <div className="pl-4 my-1.5 space-y-1.5 border-l-2 border-border">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary font-bold">
              <GitBranch className="w-3 h-3" />
              <span>Alternative Variations:</span>
            </div>
            {sideVariations.map((sid) => renderBranch(sid, true))}
          </div>
        ) : null}

        {/* Main continuation */}
        {mainChildId ? renderBranch(mainChildId, false) : null}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col space-y-2 overflow-y-auto max-h-[500px] p-4 bg-card text-card-foreground border border-border rounded-xl shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Branching Repertoire Tree
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {Object.keys(study.nodes).length} moves recorded
        </span>
      </div>

      <div className="space-y-3 font-mono text-sm">
        {study.rootNodeIds.map((rootId) => renderBranch(rootId))}
      </div>
    </div>
  );
}
