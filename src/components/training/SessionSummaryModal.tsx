"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { TrainingMistake } from "@/types/chess";

interface SessionSummaryModalProps {
  isOpen: boolean;
  accuracy: number;
  movesTested: number;
  correctMoves: number;
  incorrectMoves: number;
  durationSeconds: number;
  mistakes: TrainingMistake[];
  onRestart: () => void;
  onExit: () => void;
}

export function SessionSummaryModal({
  isOpen,
  accuracy,
  movesTested,
  correctMoves,
  incorrectMoves,
  durationSeconds,
  mistakes,
  onRestart,
  onExit,
}: SessionSummaryModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti if accuracy is good
      if (accuracy >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, accuracy]);

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const timeStr = `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onExit}
      title="Training Session Completed!"
      description="Here is your performance breakdown for this practice run."
      maxWidth="lg"
    >
      <div className="space-y-5 pt-2">
        {/* Score banner */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-950/40 to-neutral-950 rounded-xl border border-amber-900/40 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-100">{accuracy}%</div>
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mt-1">
            Repertoire Accuracy
          </div>
          <p className="text-xs text-neutral-400 mt-2 max-w-sm">
            {accuracy === 100
              ? "Flawless memory! You executed your repertoire without a single mistake."
              : accuracy >= 80
              ? "Great retention! A few lines need slight reinforcement."
              : "Good training effort. Review the mistakes below and practice again."}
          </p>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Total Moves</div>
            <div className="text-base font-bold text-neutral-100 mt-0.5">{movesTested}</div>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Correct Moves</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{correctMoves}</div>
          </div>
          <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="text-xs text-neutral-400 font-medium">Session Time</div>
            <div className="text-base font-bold text-neutral-200 mt-0.5">{timeStr}</div>
          </div>
        </div>

        {/* Mistakes Review Table */}
        {mistakes.length > 0 ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Problem Positions ({mistakes.length}):</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <span className="text-neutral-400 font-mono">
                    Pos #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 line-through font-mono">
                      {m.playedSan}
                    </span>
                    <span className="text-neutral-500">→</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      Expected: {m.expectedSan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <Button variant="secondary" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Study
          </Button>

          <Button variant="amber" size="sm" onClick={onRestart}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Practice Again
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
