"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Study } from "@/types/chess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChessboardView } from "@/components/chess/ChessboardView";
import { Chess } from "chess.js";
import { STARTING_FEN } from "@/lib/chess-tree";
import {
  Swords,
  Upload,
  ArrowRight,
  GitBranch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function GamesImportPage() {
  const router = useRouter();

  const [selectedStudyId, setSelectedStudyId] = useState<string>("");
  const [pgnText, setPgnText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: studiesData } = useQuery({
    queryKey: ["games-page-studies"],
    queryFn: async () => {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error("Failed to load studies");
      return res.json();
    },
  });

  const studies: Study[] = studiesData?.studies || [];

  // Automatically select first study if none selected
  React.useEffect(() => {
    if (!selectedStudyId && studies.length > 0) {
      setSelectedStudyId(studies[0]._id);
    }
  }, [selectedStudyId, studies]);

  const selectedStudy = studies.find((s) => s._id === selectedStudyId);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudyId) {
      setErrorMessage("Please select a study to update.");
      return;
    }
    if (!pgnText.trim()) {
      setErrorMessage("Please paste a PGN game or move string.");
      return;
    }

    setIsImporting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/studies/${selectedStudyId}/pgn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pgn: pgnText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import PGN moves");
      }

      setSuccessMessage(data.message || "Moves successfully merged into your repertoire!");
      setTimeout(() => {
        router.push(`/studies/${selectedStudyId}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import game";
      setErrorMessage(msg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-neutral-100 tracking-tight">
            Real Games & PGN Expansion
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Encountered a surprise opponent move in a real game on Chess.com, Lichess, or OTB?
          Import the game or line directly into your study without overwriting existing variations.
        </p>
      </div>

      {successMessage ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage} Redirecting to your updated repertoire tree...</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="md:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Target Repertoire Study *
              </label>
              <select
                value={selectedStudyId}
                onChange={(e) => setSelectedStudyId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
              >
                {studies.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.color === "white" ? "White" : "Black"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Paste PGN Game or Move Sequence *
              </label>
              <textarea
                value={pgnText}
                onChange={(e) => setPgnText(e.target.value)}
                rows={9}
                placeholder={`1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O...`}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                required
              />
            </div>

            <Button
              type="submit"
              variant="amber"
              className="w-full font-semibold"
              isLoading={isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              Merge & Expand Repertoire
            </Button>
          </form>
        </div>

        {/* Right Info Guide */}
        <div className="md:col-span-5 flex flex-col justify-between p-5 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Safe Merge Guarantee</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              When merging real games into your repertoire:
            </p>
            <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-neutral-200">No Overwriting:</strong> Any moves you already have saved will be safely preserved.
              </li>
              <li>
                <strong className="text-neutral-200">Automatic Branching:</strong> Novel opponent moves automatically form side variations.
              </li>
              <li>
                <strong className="text-neutral-200">Instant Practice:</strong> Once imported, you can practice your responses immediately in Guided or Recall mode.
              </li>
            </ul>
          </div>

          {selectedStudy ? (
            <div className="mt-6 pt-4 border-t border-neutral-800/80">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                Selected Study Preview
              </div>
              <div className="text-sm font-bold text-neutral-200 mt-1">
                {selectedStudy.name}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Opening: {selectedStudy.openingName} • {Object.keys(selectedStudy.nodes).length} moves saved
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
