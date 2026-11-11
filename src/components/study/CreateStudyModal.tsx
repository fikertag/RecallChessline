"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChessColor } from "@/types/chess";
import { STARTING_FEN } from "@/lib/chess-tree";

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studyId: string) => void;
}

export function CreateStudyModal({ isOpen, onClose, onSuccess }: CreateStudyModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [openingName, setOpeningName] = useState("");
  const [color, setColor] = useState<ChessColor>("white");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [startingFen, setStartingFen] = useState(STARTING_FEN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a study name.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          openingName: openingName.trim() || name.trim(),
          color,
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          startingFen: startingFen.trim() || STARTING_FEN,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create study");
      }

      onClose();
      // Reset form
      setName("");
      setOpeningName("");
      setDescription("");
      setVideoUrl("");
      setStartingFen(STARTING_FEN);

      if (onSuccess) {
        onSuccess(data.study._id);
      } else {
        router.push(`/studies/${data.study._id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create study";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Chess Opening Study"
      description="Start an opening study with branching variations and tactical plans."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error ? (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Study Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Italian Game — Evans Gambit"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Repertoire Color *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setColor("white")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  color === "white"
                    ? "bg-neutral-100 text-neutral-900 border-white shadow-sm"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setColor("black")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  color === "black"
                    ? "bg-neutral-950 text-neutral-100 border-amber-500 shadow-sm"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                }`}
              >
                Black
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Opening Name
            </label>
            <Input
              value={openingName}
              onChange={(e) => setOpeningName(e.target.value)}
              placeholder="e.g. Italian Game"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Description & Key Plans
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Core ideas, pawn breaks, key goals for this repertoire..."
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            YouTube Video Reference URL (Optional)
          </label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default" size="sm" isLoading={isLoading}>
            Create Study
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
