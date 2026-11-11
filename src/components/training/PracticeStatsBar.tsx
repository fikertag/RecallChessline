"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="flex items-center gap-2 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
        <Target className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
            Mode
          </span>
          <span className="text-xs font-semibold text-neutral-200 capitalize">
            {mode === "guided" ? "Guided Practice" : "Active Recall"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
        <Award className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
            Accuracy
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {accuracy}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
            Correct Moves
          </span>
          <span className="text-sm font-bold text-neutral-100">
            {correctMoves}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/80">
        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
            Mistakes
          </span>
          <span className="text-sm font-bold text-red-400">
            {incorrectMoves}
          </span>
        </div>
      </div>
    </div>
  );
}
