"use client";

import { create } from "zustand";
import { ChessColor, BoardPreferences } from "@/types/chess";
import { sounds } from "@/lib/sound";

interface BoardState {
  orientation: ChessColor;
  theme: BoardPreferences["boardTheme"];
  pieceSet: BoardPreferences["pieceSet"];
  soundEnabled: boolean;
  showCoordinates: boolean;
  selectedSquare: string | null;
  customSquareStyles: Record<string, React.CSSProperties>;

  // Actions
  setOrientation: (color: ChessColor) => void;
  toggleOrientation: () => void;
  setTheme: (theme: BoardPreferences["boardTheme"]) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setShowCoordinates: (show: boolean) => void;
  setSelectedSquare: (square: string | null) => void;
  highlightSquares: (squares: string[], color?: string) => void;
  clearHighlights: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  orientation: "white",
  theme: "classic",
  pieceSet: "standard",
  soundEnabled: true,
  showCoordinates: true,
  selectedSquare: null,
  customSquareStyles: {},

  setOrientation: (color) => set({ orientation: color }),
  toggleOrientation: () =>
    set((state) => ({ orientation: state.orientation === "white" ? "black" : "white" })),
  setTheme: (theme) => set({ theme }),
  setSoundEnabled: (enabled) => {
    sounds.setEnabled(enabled);
    set({ soundEnabled: enabled });
  },
  setShowCoordinates: (show) => set({ showCoordinates: show }),
  setSelectedSquare: (square) => set({ selectedSquare: square }),
  highlightSquares: (squares, color = "rgba(234, 179, 8, 0.4)") => {
    const styles: Record<string, React.CSSProperties> = {};
    squares.forEach((sq) => {
      styles[sq] = { backgroundColor: color };
    });
    set({ customSquareStyles: styles });
  },
  clearHighlights: () => set({ customSquareStyles: {}, selectedSquare: null }),
}));

