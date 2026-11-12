"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Study } from "@/types/chess";
import {
  getAllVariationLines,
  getLongestVariationLine,
  getRandomVariationLine,
  VariationLine,
} from "@/lib/chess-tree";
import { useStudyStore } from "@/store/study-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Dices,
  ListFilter,
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StudyLineSelectionMode = "longest" | "random" | "manual";

interface LineStudySelectorProps {
  study: Study;
  className?: string;
}

export function LineStudySelector({ study, className }: LineStudySelectorProps) {
  const { selectVariation, setCurrentNodeId, currentNodeId } = useStudyStore();

  const allLines = useMemo(() => getAllVariationLines(study), [study]);
  const longestLine = useMemo(() => getLongestVariationLine(study), [study]);

  const [selectionMode, setSelectionMode] = useState<StudyLineSelectionMode>("longest");
  const [selectedLineId, setSelectedLineId] = useState<string>(
    longestLine ? longestLine.id : allLines[0]?.id || ""
  );

  // When study changes or lines update, keep selection valid
  useEffect(() => {
    if (allLines.length > 0) {
      if (selectionMode === "longest" && longestLine) {
        setSelectedLineId(longestLine.id);
      } else if (!allLines.some((l) => l.id === selectedLineId)) {
        setSelectedLineId(allLines[0].id);
      }
    }
  }, [allLines, longestLine, selectionMode, selectedLineId]);

  // Current active line object
  const activeLine: VariationLine | null = useMemo(() => {
    if (allLines.length === 0) return null;
    return allLines.find((l) => l.id === selectedLineId) || allLines[0] || null;
  }, [allLines, selectedLineId]);

  const handleModeChange = (mode: StudyLineSelectionMode) => {
    setSelectionMode(mode);
    if (mode === "longest") {
      if (longestLine) {
        setSelectedLineId(longestLine.id);
      }
    } else if (mode === "random") {
      const rand = getRandomVariationLine(study);
      if (rand) {
        setSelectedLineId(rand.id);
      }
    }
  };

  const handleRollRandom = () => {
    const rand = getRandomVariationLine(study);
    if (rand) {
      setSelectedLineId(rand.id);
    }
  };

  const handleJumpToEndOfLine = () => {
    if (activeLine && activeLine.moves.length > 0) {
      const lastMove = activeLine.moves[activeLine.moves.length - 1];
      selectVariation(lastMove.id);
    }
  };

  const handleStartLineFromBeginning = () => {
    if (activeLine && activeLine.moves.length > 0) {
      const firstMove = activeLine.moves[0];
      selectVariation(firstMove.id);
    }
  };

  if (allLines.length === 0) {
    return (
      <div
        className={cn(
          "p-3.5 bg-card text-card-foreground border border-border rounded-xl shadow-xs text-xs space-y-1.5",
          className
        )}
      >
        <div className="flex items-center gap-2 font-medium text-muted-foreground">
          <GitBranch className="w-4 h-4 text-primary" />
          <span>No saved variation lines in this study yet.</span>
        </div>
        <p className="text-muted-foreground">
          Make moves on the board to build your opening repertoire lines.
        </p>
      </div>
    );
  }

  const isCurrentNodeInLine = activeLine
    ? activeLine.nodeIds.includes(currentNodeId || "")
    : false;

  return (
    <div
      className={cn(
        "p-4 bg-card text-card-foreground border border-border rounded-xl shadow-xs space-y-3",
        className
      )}
    >
      {/* Header with variations count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Study Line Selection
          </h3>
        </div>
        <Badge variant="outline" className="text-[11px] font-normal">
          {allLines.length} {allLines.length === 1 ? "Line" : "Lines"} in Tree
        </Badge>
      </div>

      {/* 3 Strategy Selector Tabs: Longest, Random, Manual */}
      <div className="grid grid-cols-3 gap-1.5 tabs-track">
        <button
          type="button"
          onClick={() => handleModeChange("longest")}
          className={cn(
            "tab-btn gap-1.5 py-2",
            selectionMode === "longest"
              ? "tab-btn-active text-amber-600 dark:text-amber-400 font-bold"
              : "hover:bg-background/40"
          )}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Longest
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("random")}
          className={cn(
            "tab-btn gap-1.5 py-2",
            selectionMode === "random"
              ? "tab-btn-active text-emerald-600 dark:text-emerald-400 font-bold"
              : "hover:bg-background/40"
          )}
        >
          <Dices className="w-3.5 h-3.5 text-emerald-500" />
          Random
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("manual")}
          className={cn(
            "tab-btn gap-1.5 py-2",
            selectionMode === "manual"
              ? "tab-btn-active text-blue-600 dark:text-blue-400 font-bold"
              : "hover:bg-background/40"
          )}
        >
          <ListFilter className="w-3.5 h-3.5 text-blue-500" />
          Manual
        </button>
      </div>

      {/* Manual Selection Dropdown */}
      {selectionMode === "manual" && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground block">
            Choose Line from Tree:
          </label>
          <select
            value={selectedLineId}
            onChange={(e) => setSelectedLineId(e.target.value)}
            className="w-full text-xs bg-background text-foreground border border-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {allLines.map((line, idx) => (
              <option key={line.id} value={line.id}>
                Line {idx + 1} ({line.length} moves): {line.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Random Mode Re-roll button */}
      {selectionMode === "random" && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Randomly selected branch</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRollRandom}
            className="h-7 text-xs px-2.5"
          >
            <Dices className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            Pick Another Line
          </Button>
        </div>
      )}

      {/* Active Line Display Box */}
      {activeLine && (
        <div className="p-3 bg-muted/40 rounded-lg border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              {selectionMode === "longest" && (
                <span className="text-amber-500 font-bold">Deepest Mainline</span>
              )}
              {selectionMode === "random" && (
                <span className="text-emerald-500 font-bold">Random Variation</span>
              )}
              {selectionMode === "manual" && (
                <span className="text-blue-500 font-bold">Selected Variation</span>
              )}
            </span>
            <Badge variant="default" className="text-[11px]">
              {activeLine.length} moves
            </Badge>
          </div>

          {/* Moves notation sequence */}
          <div className="p-2 bg-background border border-border rounded font-mono text-[11px] text-foreground leading-relaxed max-h-24 overflow-y-auto">
            {activeLine.name}
          </div>

          {/* Action buttons: Jump on board & Practice */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartLineFromBeginning}
              className="text-xs h-7 px-2"
              title="Step to start of this line"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Line Start
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleJumpToEndOfLine}
              className="text-xs h-7 px-2"
              title="Jump board to final position of this line"
            >
              <Play className="w-3 h-3 mr-1" />
              Jump to End
            </Button>

            <Link
              href={`/studies/${study._id}/train?strategy=${selectionMode}&lineId=${activeLine.id}`}
              className="ml-auto"
            >
              <Button variant="amber" size="sm" className="text-xs h-7 px-2.5 font-semibold">
                <GraduationCap className="w-3.5 h-3.5 mr-1" />
                Train This Line
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
