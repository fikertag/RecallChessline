"use client";

import React from "react";
import { CheckCircle2, XCircle, Target, Award } from "lucide-react";

interface PracticeStatsBarProps {
  mode: "guided" | "recall";
  movesTested: number;
  correctMoves: number;
  incorrectMoves: number;
  accuracy: number;
}

export function PracticeStatsBar({
  mode,
  movesTested,
  correctMoves,
  incorrectMoves,
  accuracy,
}: PracticeStatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-card text-card-foreground border border-border rounded-xl shadow-xs">
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
        <Target className="w-4 h-4 text-primary shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
            Mode
          </span>
          <span className="text-xs font-semibold text-foreground capitalize">
            {mode === "guided" ? "Guided Practice" : "Active Recall"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
        <Award className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
            Accuracy
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
            Correct Moves
          </span>
          <span className="text-sm font-bold text-foreground">
            {correctMoves}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
        <XCircle className="w-4 h-4 text-destructive shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
            Mistakes
          </span>
          <span className="text-sm font-bold text-destructive">
            {incorrectMoves}
          </span>
        </div>
      </div>
    </div>
  );
}
