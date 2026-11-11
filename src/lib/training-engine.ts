import { Study, MoveNode, TrainingMistake } from "@/types/chess";
import { getFenAtNode } from "./chess-tree";
import { Chess } from "chess.js";

export interface TrainingState {
  study: Study;
  mode: "guided" | "recall";
  currentNodeId: string | null;
  currentFen: string;
  isUserTurn: boolean;
  movesTested: number;
  correctMoves: number;
  incorrectMoves: number;
  mistakes: TrainingMistake[];
  completedLines: number;
  isLineFinished: boolean;
  solutionRevealed: boolean;
  lastFeedback: {
    status: "correct" | "incorrect" | "ready" | "complete";
    message: string;
  };
}

export function isUserMoveTurn(study: Study, fen: string): boolean {
  const activeColor = fen.split(" ")[1] === "w" ? "white" : "black";
  return study.color === activeColor;
}

export function initTrainingState(study: Study, mode: "guided" | "recall"): TrainingState {
  const startFen = study.startingFen;
  const isUserTurn = isUserMoveTurn(study, startFen);

  return {
    study,
    mode,
    currentNodeId: null,
    currentFen: startFen,
    isUserTurn,
    movesTested: 0,
    correctMoves: 0,
    incorrectMoves: 0,
    mistakes: [],
    completedLines: 0,
    isLineFinished: false,
    solutionRevealed: false,
    lastFeedback: {
      status: "ready",
      message: isUserTurn
        ? `Your turn (${study.color.toUpperCase()})! Play your repertoire move.`
        : "Opponent's turn. Making first move...",
    },
  };
}

/**
 * Gets valid candidate moves for the next step from currentNodeId in the study.
 */
export function getAvailableRepertoireMoves(study: Study, currentNodeId: string | null): MoveNode[] {
  const childIds = currentNodeId ? study.nodes[currentNodeId]?.children || [] : study.rootNodeIds;
  return childIds.map((id) => study.nodes[id]).filter(Boolean);
}

/**
 * Validates a user move against the study repertoire.
 */
export function testUserMove(
  state: TrainingState,
  moveInput: { from: string; to: string; promotion?: string }
): {
  isCorrect: boolean;
  matchedNode: MoveNode | null;
  newState: TrainingState;
} {
  const currentFen = state.currentFen;
  const chess = new Chess(currentFen);
  const moveRes = chess.move({
    from: moveInput.from,
    to: moveInput.to,
    promotion: moveInput.promotion || "q",
  });

  if (!moveRes) {
    return {
      isCorrect: false,
      matchedNode: null,
      newState: {
        ...state,
        lastFeedback: { status: "incorrect", message: "Illegal chess move." },
      },
    };
  }

  const uci = `${moveRes.from}${moveRes.to}${moveRes.promotion || ""}`;
  const candidates = getAvailableRepertoireMoves(state.study, state.currentNodeId);

  // Check if played move matches any saved repertoire response
  const matched = candidates.find(
    (c) => c.uci === uci || c.san === moveRes.san
  );

  if (matched) {
    const isFinished = matched.children.length === 0;
    const nextFen = matched.fen;
    const nextIsUserTurn = isUserMoveTurn(state.study, nextFen);

    const newState: TrainingState = {
      ...state,
      currentNodeId: matched.id,
      currentFen: nextFen,
      isUserTurn: nextIsUserTurn,
      movesTested: state.movesTested + 1,
      correctMoves: state.correctMoves + 1,
      isLineFinished: isFinished,
      completedLines: isFinished ? state.completedLines + 1 : state.completedLines,
      solutionRevealed: false,
      lastFeedback: {
        status: isFinished ? "complete" : "correct",
        message: isFinished
          ? "Variation complete! Excellent preparation."
          : `Correct! ${matched.san} is your repertoire move.`,
      },
    };

    return { isCorrect: true, matchedNode: matched, newState };
  } else {
    // Expected SANs
    const expectedSans = candidates.map((c) => c.san).join(" or ") || "None saved";
    const mistake: TrainingMistake = {
      fen: currentFen,
      expectedSan: expectedSans,
      playedSan: moveRes.san,
      nodeId: state.currentNodeId || "root",
      comment: "Incorrect repertoire move played during practice.",
    };

    const newState: TrainingState = {
      ...state,
      movesTested: state.movesTested + 1,
      incorrectMoves: state.incorrectMoves + 1,
      mistakes: [...state.mistakes, mistake],
      lastFeedback: {
        status: "incorrect",
        message: `Not in your repertoire (${moveRes.san}). Try again or reveal the move.`,
      },
    };

    return { isCorrect: false, matchedNode: null, newState };
  }
}

/**
 * Selects an opponent response from the available saved branches.
 */
export function getOpponentMove(state: TrainingState): {
  node: MoveNode | null;
  newState: TrainingState;
} {
  const candidates = getAvailableRepertoireMoves(state.study, state.currentNodeId);
  if (candidates.length === 0) {
    return {
      node: null,
      newState: {
        ...state,
        isLineFinished: true,
        lastFeedback: {
          status: "complete",
          message: "Reached the end of this repertoire branch.",
        },
      },
    };
  }

  // Pick random branch to practice diversity
  const selectedNode = candidates[Math.floor(Math.random() * candidates.length)];
  const nextFen = selectedNode.fen;
  const isFinished = selectedNode.children.length === 0;
  const nextIsUserTurn = isUserMoveTurn(state.study, nextFen);

  const newState: TrainingState = {
    ...state,
    currentNodeId: selectedNode.id,
    currentFen: nextFen,
    isUserTurn: nextIsUserTurn,
    isLineFinished: isFinished,
    solutionRevealed: false,
    lastFeedback: {
      status: isFinished ? "complete" : "ready",
      message: isFinished
        ? `Opponent played ${selectedNode.san}. Line completed!`
        : `Opponent played ${selectedNode.san}. Your response?`,
    },
  };

  return { node: selectedNode, newState };
}
