"use client";

import React from "react";
import { useStudyStore } from "@/store/study-store";
import { MoveNode, Study } from "@/types/chess";
import { cn } from "@/lib/utils";
import { GitBranch, MessageSquare, Tag } from "lucide-react";

interface MoveTreeVisualizerProps {
  onOpenAnnotationModal?: (nodeId: string) => void;
}

export function MoveTreeVisualizer({ onOpenAnnotationModal }: MoveTreeVisualizerProps) {
  const { study, currentNodeId, selectVariation } = useStudyStore();

  if (!study || study.rootNodeIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
        <GitBranch className="w-8 h-8 text-neutral-600 mb-2 stroke-1" />
        <p className="text-sm font-medium text-neutral-400">Repertoire Tree is Empty</p>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
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
                ? "bg-amber-500 text-neutral-950 font-bold shadow-md ring-2 ring-amber-400/40"
                : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-white border border-neutral-700/50"
            )}
          >
            {/* Move number label */}
            <span
              className={cn(
                "text-[10px]",
                isCurrent ? "text-neutral-900 font-semibold" : "text-neutral-500"
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
                  isCurrent ? "text-neutral-950" : "text-amber-400"
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
                  isCurrent ? "text-neutral-900" : "text-neutral-400"
                )}
              />
            ) : null}
          </button>

          {/* Quick Annotation trigger button */}
          {onOpenAnnotationModal ? (
            <button
              onClick={() => onOpenAnnotationModal(node.id)}
              title="Add explanation / notation"
              className="p-1 rounded text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
            >
              <Tag className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Display brief inline note if active */}
        {node.comment && isCurrent ? (
          <div className="my-1.5 p-2 rounded-lg bg-neutral-950/80 border-l-2 border-amber-500 text-xs text-neutral-300 font-sans">
            <p className="italic text-neutral-300">{node.comment}</p>
          </div>
        ) : null}

        {/* Side variations (branches) */}
        {sideVariations.length > 0 ? (
          <div className="pl-4 my-1.5 space-y-1.5 border-l-2 border-neutral-800">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-500/80 font-bold">
              <GitBranch className="w-3 h-3" />
              <span>Alternative Opponent Variations:</span>
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
    <div className="w-full flex flex-col space-y-2 overflow-y-auto max-h-[500px] p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Branching Repertoire Tree
          </h3>
        </div>
        <span className="text-[11px] text-neutral-500">
          {Object.keys(study.nodes).length} moves recorded
        </span>
      </div>

      <div className="space-y-3 font-mono text-sm">
        {study.rootNodeIds.map((rootId) => renderBranch(rootId))}
      </div>
    </div>
  );
}
