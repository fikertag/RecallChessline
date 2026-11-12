"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Study } from "@/types/chess";
import {
  TrainingState,
  LineStrategy,
  initTrainingState,
  testUserMove,
  getOpponentMove,
  getAvailableRepertoireMoves,
} from "@/lib/training-engine";
import { getAllVariationLines } from "@/lib/chess-tree";
import { ChessboardView } from "@/components/chess/ChessboardView";
import { PracticeStatsBar } from "./PracticeStatsBar";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound";
import { useBoardStore } from "@/store/board-store";
import {
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Zap,
  Dices,
  ListFilter,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingBoardProps {
  study: Study;
  initialMode?: "guided" | "recall";
  initialStrategy?: LineStrategy;
  initialLineId?: string;
}

export function TrainingBoard({
  study,
  initialMode = "guided",
  initialStrategy = "random",
  initialLineId,
}: TrainingBoardProps) {
  const router = useRouter();
  const { setOrientation, soundEnabled, setSoundEnabled, toggleOrientation } = useBoardStore();

  const allLines = useMemo(() => getAllVariationLines(study), [study]);

  const [mode, setMode] = useState<"guided" | "recall">(initialMode);
  const [strategy, setStrategy] = useState<LineStrategy>(initialStrategy);
  const [selectedLineId, setSelectedLineId] = useState<string>(
    initialLineId || (allLines[0] ? allLines[0].id : "")
  );

  const [trainingState, setTrainingState] = useState<TrainingState>(() =>
    initTrainingState(study, initialMode, {
      lineStrategy: initialStrategy,
      manualLineId: initialLineId,
    })
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
    setTrainingState(
      initTrainingState(study, mode, {
        lineStrategy: strategy,
        manualLineId: selectedLineId,
      })
    );
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleNextLine = () => {
    // If strategy is random, this will pick a new random line
    setTrainingState(
      initTrainingState(study, mode, {
        lineStrategy: strategy,
        manualLineId: selectedLineId,
      })
    );
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleSwitchMode = (newMode: "guided" | "recall") => {
    setMode(newMode);
    setTrainingState(
      initTrainingState(study, newMode, {
        lineStrategy: strategy,
        manualLineId: selectedLineId,
      })
    );
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleSwitchStrategy = (newStrategy: LineStrategy) => {
    setStrategy(newStrategy);
    const chosenLineId = selectedLineId || (allLines[0] ? allLines[0].id : undefined);

    setTrainingState(
      initTrainingState(study, mode, {
        lineStrategy: newStrategy,
        manualLineId: chosenLineId,
      })
    );
    setLastMoveSquares(null);
    setIsSummaryOpen(false);
  };

  const handleManualLineChange = (lineId: string) => {
    setSelectedLineId(lineId);
    setStrategy("manual");
    setTrainingState(
      initTrainingState(study, mode, {
        lineStrategy: "manual",
        manualLineId: lineId,
      })
    );
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
    <div className="w-full">
      {/* 2-Column Responsive Layout: Chessboard on the left, all Study Header & Training UIs on the side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Compact Chessboard & Quick Board Tools */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <ChessboardView
            fen={trainingState.currentFen}
            onMove={handleUserMove}
            interactive={trainingState.isUserTurn && !trainingState.isLineFinished}
            lastMove={lastMoveSquares}
          />

          {/* Compact Quick Board Toolbar under the board */}
          <div className="flex items-center justify-between p-2.5 bg-card text-card-foreground border border-border rounded-xl shadow-xs max-w-[430px] w-full mx-auto">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleOrientation}
                title="Flip Board"
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Flip Board
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 mr-1 text-primary" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 mr-1 text-destructive" />
                )}
                {soundEnabled ? "Sound On" : "Muted"}
              </Button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestart}
              className="text-xs h-8 px-2.5"
              title="Restart Practice"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Column: All Study Header & Training UIs at the side */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Study Information & Navigation Header Card */}
          <div className="p-4 bg-card text-card-foreground border border-border rounded-xl shadow-xs space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Link href={`/studies/${study._id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                    title="Back to Study Tree"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-bold text-foreground truncate">
                      {study.name}
                    </h1>
                    <Badge variant={study.color === "white" ? "white" : "black"}>
                      {study.color === "white" ? "White Repertoire" : "Black Repertoire"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Opening Practice Mode: Test your memory against saved opponent variations.
                  </p>
                </div>
              </div>

              <Link href={`/studies/${study._id}`} className="shrink-0">
                <Button variant="secondary" size="sm" className="text-xs h-8 px-2.5">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Edit Move Tree
                </Button>
              </Link>
            </div>
          </div>

          {/* Line Selection Strategy Card: Longest vs Random vs Manual */}
          <div className="p-3.5 bg-card text-card-foreground border border-border rounded-xl shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                Line Focus Strategy
              </span>
              <Badge variant="outline" className="text-[11px] font-normal">
                {allLines.length} variations saved
              </Badge>
            </div>

            {/* 3 Strategy Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => handleSwitchStrategy("longest")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all text-xs",
                  strategy === "longest"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Longest
              </button>

              <button
                type="button"
                onClick={() => handleSwitchStrategy("random")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all text-xs",
                  strategy === "random"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Dices className="w-3.5 h-3.5 text-emerald-500" />
                Random
              </button>

              <button
                type="button"
                onClick={() => handleSwitchStrategy("manual")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium transition-all text-xs",
                  strategy === "manual"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-500" />
                Manual
              </button>
            </div>

            {/* If Manual strategy selected, show line dropdown */}
            {strategy === "manual" && allLines.length > 0 && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Select Variation Line:
                </label>
                <select
                  value={selectedLineId}
                  onChange={(e) => handleManualLineChange(e.target.value)}
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

            {/* Active Target Line Banner */}
            {trainingState.targetLine && (
              <div className="p-2 bg-muted/40 rounded border border-border/60 text-[11px] space-y-0.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Target Line ({trainingState.targetLine.length} moves):
                  </span>
                  <span className="font-mono text-[10px] text-primary">
                    {strategy === "longest" ? "Deepest Branch" : strategy === "manual" ? "Manual Pick" : "Random Line"}
                  </span>
                </div>
                <div className="font-mono text-muted-foreground truncate" title={trainingState.targetLine.name}>
                  {trainingState.targetLine.name}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher & Hint Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card text-card-foreground border border-border rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5">
              <Button
                variant={mode === "guided" ? "default" : "secondary"}
                size="sm"
                onClick={() => handleSwitchMode("guided")}
                className="text-xs font-semibold h-8"
              >
                Guided Practice
              </Button>
              <Button
                variant={mode === "recall" ? "default" : "secondary"}
                size="sm"
                onClick={() => handleSwitchMode("recall")}
                className="text-xs font-semibold h-8"
              >
                Active Recall
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShowHint}
              disabled={trainingState.isLineFinished || !trainingState.isUserTurn}
              className="text-xs text-primary hover:text-primary h-8"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              Show Hint
            </Button>
          </div>

          {/* Live Practice Stats (Mode, Accuracy, Correct Moves, Mistakes) */}
          <PracticeStatsBar
            mode={mode}
            movesTested={trainingState.movesTested}
            correctMoves={trainingState.correctMoves}
            incorrectMoves={trainingState.incorrectMoves}
            accuracy={currentAccuracy}
          />

          {/* Live Turn & Move Feedback Card */}
          <div
            className={`p-4 rounded-xl border transition-all shadow-xs ${
              trainingState.lastFeedback.status === "correct"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : trainingState.lastFeedback.status === "incorrect"
                ? "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-300"
                : trainingState.lastFeedback.status === "complete"
                ? "bg-primary/10 border-primary/30 text-primary dark:text-amber-300"
                : "bg-card text-card-foreground border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {trainingState.lastFeedback.status === "complete" ? (
                <Sparkles className="w-4 h-4 text-primary" />
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

          {/* Objectives Card */}
          <div className="p-4 bg-card text-card-foreground border border-border rounded-xl space-y-2 shadow-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Training Objectives
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                Playing as:{" "}
                <span className="font-semibold text-foreground uppercase">
                  {study.color}
                </span>
              </li>
              <li>Practice remembering every saved move response.</li>
              <li>
                {mode === "guided"
                  ? "Guided mode walks you through saved opponent variations."
                  : "Active recall tests blind memory without hints."}
              </li>
            </ul>

            {trainingState.isLineFinished ? (
              <div className="pt-3">
                <Button variant="amber" className="w-full text-xs font-semibold" onClick={handleNextLine}>
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
