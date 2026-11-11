"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Study, MoveNode } from "@/types/chess";
import {
  TrainingState,
  initTrainingState,
  testUserMove,
  getOpponentMove,
  getAvailableRepertoireMoves,
} from "@/lib/training-engine";
import { ChessboardView } from "@/components/chess/ChessboardView";
import { PracticeStatsBar } from "./PracticeStatsBar";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/sound";
import { useBoardStore } from "@/store/board-store";
import {
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface TrainingBoardProps {
  study: Study;
  initialMode?: "guided" | "recall";
}

export function TrainingBoard({ study, initialMode = "guided" }: TrainingBoardProps) {
  const router = useRouter();
  const { setOrientation, soundEnabled, setSoundEnabled } = useBoardStore();

  const [mode, setMode] = useState<"guided" | "recall">(initialMode);
  const [trainingState, setTrainingState] = useState<TrainingState>(() =>
    initTrainingState(study, initialMode)
  );
  const [sessionStartTime] = useState<number>(Date.now());
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: string; to: string } | null>(null);

  // Sync board orientation with study color
  useEffect(() => {
    setOrientation(study.color);
  }, [study.color, setOrientation]);

  // Handle automated opponent move if not user turn
  useEffect(() => {
    if (!trainingState.isUserTurn && !trainingState.isLineFinished) {
      const timer = setTimeout(() => {
        const { node, newState } = getOpponentMove(trainingState);
        if (node) {
          sounds.playMove();
          setLastMoveSquares({ from: node.from, to: node.to });
        }
        setTrainingState(newState);

        if (newState.isLineFinished) {
          handleLineComplete(newState);
        }
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [trainingState.isUserTurn, trainingState.isLineFinished]);

  const handleLineComplete = useCallback(async (finalState: TrainingState) => {
    sounds.playCorrect();
    setIsSummaryOpen(true);

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    const accuracy =
      finalState.movesTested > 0
        ? Math.round((finalState.correctMoves / finalState.movesTested) * 100)
        : 100;

    try {
      await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyId: study._id,
          studyName: study.name,
          mode: finalState.mode,
          color: study.color,
          movesTested: finalState.movesTested,
          correctMoves: finalState.correctMoves,
          incorrectMoves: finalState.incorrectMoves,
          accuracy,
          completed: true,
          mistakes: finalState.mistakes,
          durationSeconds,
        }),
      });
    } catch (err) {
      console.error("Failed to save session", err);
    }
  }, [sessionStartTime, study._id, study.name, study.color]);

  const handleUserMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      if (!trainingState.isUserTurn || trainingState.isLineFinished) return;

      const { isCorrect, matchedNode, newState } = testUserMove(trainingState, move);

      if (isCorrect && matchedNode) {
        sounds.playMove();
        setLastMoveSquares({ from: matchedNode.from, to: matchedNode.to });
        setTrainingState(newState);

        if (newState.isLineFinished) {
          handleLineComplete(newState);
        }
      } else {
        sounds.playIncorrect();
        setTrainingState(newState);
      }
    },
    [trainingState, handleLineComplete]
  );

  const handleRestart = () => {
    setTrainingState(initTrainingState(study, mode));
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleSwitchMode = (newMode: "guided" | "recall") => {
    setMode(newMode);
    setTrainingState(initTrainingState(study, newMode));
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleShowHint = () => {
    const candidates = getAvailableRepertoireMoves(study, trainingState.currentNodeId);
    if (candidates.length > 0) {
      const hintSan = candidates.map((c) => c.san).join(" or ");
      setTrainingState((prev) => ({
        ...prev,
        solutionRevealed: true,
        lastFeedback: {
          status: "ready",
          message: `Expected repertoire move: ${hintSan}`,
        },
      }));
    }
  };

  const currentAccuracy =
    trainingState.movesTested > 0
      ? Math.round((trainingState.correctMoves / trainingState.movesTested) * 100)
      : 100;

  return (
    <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
      {/* Mode Switcher & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "guided" ? "default" : "secondary"}
            size="sm"
            onClick={() => handleSwitchMode("guided")}
            className="text-xs font-semibold"
          >
            Guided Practice
          </Button>
          <Button
            variant={mode === "recall" ? "default" : "secondary"}
            size="sm"
            onClick={() => handleSwitchMode("recall")}
            className="text-xs font-semibold"
          >
            Active Recall
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowHint}
            disabled={trainingState.isLineFinished || !trainingState.isUserTurn}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            Show Hint
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 text-neutral-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRestart}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Practice Stats Bar */}
      <PracticeStatsBar
        mode={mode}
        movesTested={trainingState.movesTested}
        correctMoves={trainingState.correctMoves}
        incorrectMoves={trainingState.incorrectMoves}
        accuracy={currentAccuracy}
      />

      {/* Interactive Board & Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 flex justify-center">
          <ChessboardView
            fen={trainingState.currentFen}
            onMove={handleUserMove}
            interactive={trainingState.isUserTurn && !trainingState.isLineFinished}
            lastMove={lastMoveSquares}
          />
        </div>

        <div className="md:col-span-4 flex flex-col space-y-4">
          {/* Status Feedback Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              trainingState.lastFeedback.status === "correct"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                : trainingState.lastFeedback.status === "incorrect"
                ? "bg-red-950/40 border-red-800 text-red-200"
                : trainingState.lastFeedback.status === "complete"
                ? "bg-amber-950/40 border-amber-800 text-amber-200"
                : "bg-neutral-900 border-neutral-800 text-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {trainingState.lastFeedback.status === "complete" ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : null}
              <span className="text-xs uppercase font-bold tracking-wider">
                {trainingState.lastFeedback.status === "complete"
                  ? "Line Finished!"
                  : trainingState.isUserTurn
                  ? "Your Move"
                  : "Opponent Moving"}
              </span>
            </div>
            <p className="text-sm font-medium">{trainingState.lastFeedback.message}</p>
          </div>

          {/* Quick instructions & Line Progress */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Training Objectives
            </h4>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>
                Playing as:{" "}
                <span className="font-semibold text-neutral-100 uppercase">
                  {study.color}
                </span>
              </li>
              <li>Practice remembering every saved move response.</li>
              <li>
                {mode === "guided"
                  ? "The engine guides you through alternate branches."
                  : "Active recall tests blind memory without hints."}
              </li>
            </ul>

            {trainingState.isLineFinished ? (
              <div className="pt-3">
                <Button variant="amber" className="w-full text-xs" onClick={handleRestart}>
                  Practice Next Line
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      <SessionSummaryModal
        isOpen={isSummaryOpen}
        accuracy={currentAccuracy}
        movesTested={trainingState.movesTested}
        correctMoves={trainingState.correctMoves}
        incorrectMoves={trainingState.incorrectMoves}
        durationSeconds={Math.round((Date.now() - sessionStartTime) / 1000)}
        mistakes={trainingState.mistakes}
        onRestart={handleRestart}
        onExit={() => router.push(`/studies/${study._id}`)}
      />
    </div>
  );
}
