"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { ChessColor } from "@/types/chess";

interface PromotionModalProps {
  isOpen: boolean;
  color: ChessColor;
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

export function PromotionModal({ isOpen, color, onSelect, onCancel }: PromotionModalProps) {
  const pieces: Array<{ type: "q" | "r" | "b" | "n"; name: string; symbolWhite: string; symbolBlack: string }> = [
    { type: "q", name: "Queen", symbolWhite: "♕", symbolBlack: "♛" },
    { type: "r", name: "Rook", symbolWhite: "♖", symbolBlack: "♜" },
    { type: "b", name: "Bishop", symbolWhite: "♗", symbolBlack: "♝" },
    { type: "n", name: "Knight", symbolWhite: "♘", symbolBlack: "♞" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title="Pawn Promotion"
      description="Choose a piece to promote your pawn."
      maxWidth="sm"
    >
      <div className="grid grid-cols-4 gap-3 my-2">
        {pieces.map((p) => (
          <button
            key={p.type}
            onClick={() => onSelect(p.type)}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all active:scale-95 group"
          >
            <span className="text-4xl text-neutral-100 group-hover:scale-110 transition-transform">
              {color === "white" ? p.symbolWhite : p.symbolBlack}
            </span>
            <span className="text-xs text-neutral-400 mt-1 font-medium">{p.name}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
