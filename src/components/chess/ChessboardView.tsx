"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useBoardStore } from "@/store/board-store";
import { PromotionModal } from "./PromotionModal";

interface ChessboardViewProps {
  fen: string;
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  interactive?: boolean;
  lastMove?: { from: string; to: string } | null;
  boardWidth?: number;
}

export function ChessboardView({
  fen,
  onMove,
  interactive = true,
  lastMove,
  boardWidth,
}: ChessboardViewProps) {
  const {
    orientation,
    theme,
    showCoordinates,
    customSquareStyles: storeSquareStyles,
  } = useBoardStore();

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: "white" | "black";
  } | null>(null);

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  // Compute legal destination squares for the selected piece
  const legalMoveSquares = useMemo(() => {
    if (!selectedSquare || !interactive) return [];
    try {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      return moves.map((m) => m.to);
    } catch {
      return [];
    }
  }, [chess, selectedSquare, interactive]);

  // Combined custom styles for squares (highlights, last move, selected piece, dots)
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...storeSquareStyles };

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(234, 179, 8, 0.35)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(234, 179, 8, 0.45)",
      };
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(245, 158, 11, 0.6)",
      };
    }

    // Highlight legal target squares
    legalMoveSquares.forEach((sq) => {
      const pieceOnSquare = chess.get(sq);
      if (pieceOnSquare) {
        // Capture circle target
        styles[sq] = {
          background: "radial-gradient(circle, transparent 60%, rgba(239, 68, 68, 0.6) 61%)",
          borderRadius: "50%",
        };
      } else {
        // Legal move dot
        styles[sq] = {
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.7) 22%, transparent 24%)",
          borderRadius: "50%",
        };
      }
    });

    // Check indicator on King
    if (chess.inCheck()) {
      const turn = chess.turn();
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === "k" && piece.color === turn) {
            const file = String.fromCharCode(97 + c);
            const rank = 8 - r;
            const kingSq = `${file}${rank}`;
            styles[kingSq] = {
              background: "radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.4) 60%, transparent 80%)",
            };
          }
        }
      }
    }

    return styles;
  }, [storeSquareStyles, lastMove, selectedSquare, legalMoveSquares, chess]);

  // Color theme definitions
  const customDarkSquareStyle = useMemo(() => {
    switch (theme) {
      case "wood":
        return { backgroundColor: "#b58863" };
      case "green":
        return { backgroundColor: "#769656" };
      case "blue":
        return { backgroundColor: "#4f7797" };
      case "glass":
        return { backgroundColor: "#2b2d42" };
      default:
        // Classic Warm Chessboard
        return { backgroundColor: "#8a5839" };
    }
  }, [theme]);

  const customLightSquareStyle = useMemo(() => {
    switch (theme) {
      case "wood":
        return { backgroundColor: "#f0d9b5" };
      case "green":
        return { backgroundColor: "#eeeed2" };
      case "blue":
        return { backgroundColor: "#c5d5e4" };
      case "glass":
        return { backgroundColor: "#8d99ae" };
      default:
        // Classic Warm Chessboard
        return { backgroundColor: "#f3e7db" };
    }
  }, [theme]);

  const isPromotionMove = useCallback(
    (from: Square, to: Square): boolean => {
      const piece = chess.get(from);
      if (!piece || piece.type !== "p") return false;
      const rank = to[1];
      return (piece.color === "w" && rank === "8") || (piece.color === "b" && rank === "1");
    },
    [chess]
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (!interactive || !onMove) return false;

      // Check for pawn promotion
      if (isPromotionMove(sourceSquare, targetSquare)) {
        const piece = chess.get(sourceSquare);
        setPendingPromotion({
          from: sourceSquare,
          to: targetSquare,
          color: piece?.color === "w" ? "white" : "black",
        });
        return false;
      }

      try {
        // Validate legality
        const testMove = chess.move({
          from: sourceSquare,
          to: targetSquare,
        });

        if (!testMove) {
          setSelectedSquare(null);
          return false;
        }

        // Undo internal test move and fire callback
        chess.undo();
        setSelectedSquare(null);
        onMove({
          from: sourceSquare,
          to: targetSquare,
        });
        return true;
      } catch {
        setSelectedSquare(null);
        return false;
      }
    },
    [interactive, onMove, isPromotionMove, chess]
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!interactive || !onMove) return;

      // If no piece is currently selected
      if (!selectedSquare) {
        const piece = chess.get(square);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(square);
        }
        return;
      }

      // If clicked on another piece of the same color, switch selection
      const clickedPiece = chess.get(square);
      if (clickedPiece && clickedPiece.color === chess.turn()) {
        setSelectedSquare(square);
        return;
      }

      // Check promotion
      if (isPromotionMove(selectedSquare, square)) {
        const piece = chess.get(selectedSquare);
        setPendingPromotion({
          from: selectedSquare,
          to: square,
          color: piece?.color === "w" ? "white" : "black",
        });
        setSelectedSquare(null);
        return;
      }

      // Attempt move
      try {
        const testMove = chess.move({
          from: selectedSquare,
          to: square,
        });

        if (testMove) {
          chess.undo();
          onMove({
            from: selectedSquare,
            to: square,
          });
        }
      } catch {
        // Not a legal move
      }

      setSelectedSquare(null);
    },
    [interactive, onMove, selectedSquare, chess, isPromotionMove]
  );

  const handlePromotionSelect = (pieceType: "q" | "r" | "b" | "n") => {
    if (!pendingPromotion || !onMove) return;
    onMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: pieceType,
    });
    setPendingPromotion(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[560px] mx-auto select-none">
      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-neutral-800 bg-neutral-900 transition-all">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: interactive,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              handlePieceDrop(sourceSquare as Square, targetSquare as Square),
            onSquareClick: ({ square }) => handleSquareClick(square as Square),
            squareStyles: customSquareStyles,
            darkSquareStyle: customDarkSquareStyle,
            lightSquareStyle: customLightSquareStyle,
            showNotation: showCoordinates,
            animationDurationInMs: 200,
          }}
        />
      </div>

      <PromotionModal
        isOpen={!!pendingPromotion}
        color={pendingPromotion?.color || "white"}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />
    </div>
  );
}
