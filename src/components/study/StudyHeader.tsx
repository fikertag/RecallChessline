"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Download,
  Copy,
  Video,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudyStore } from "@/store/study-store";

interface StudyHeaderProps {
  onOpenVideoModal?: () => void;
}

export function StudyHeader({ onOpenVideoModal }: StudyHeaderProps) {
  const router = useRouter();
  const { study, isSaving, hasUnsavedChanges, saveStudy } = useStudyStore();
  const [copiedPgn, setCopiedPgn] = useState(false);

  if (!study) return null;

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/studies/${study._id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/studies/${data.study._id}`);
      }
    } catch (err) {
      console.error("Duplicate failed", err);
    }
  };

  const handleDownloadPgn = () => {
    window.open(`/api/studies/${study._id}/pgn`, "_blank");
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="flex items-center gap-3">
        <Link href="/studies">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-100">{study.name}</h1>
            <Badge variant={study.color === "white" ? "white" : "black"}>
              {study.color === "white" ? "White Repertoire" : "Black Repertoire"}
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Opening: <span className="text-neutral-200 font-medium">{study.openingName}</span>
            {study.tags && study.tags.length > 0 ? (
              <span className="ml-2 text-neutral-500">• {study.tags.join(", ")}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* Video button if study has video */}
        {study.videoUrl && onOpenVideoModal ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenVideoModal}
            className="text-red-400 border-red-900/40 hover:bg-red-950/30"
          >
            <Video className="w-4 h-4 mr-1.5" />
            Video Reference
          </Button>
        ) : null}

        {/* Duplicate button */}
        <Button variant="secondary" size="sm" onClick={handleDuplicate} title="Duplicate this study">
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          Duplicate
        </Button>

        {/* Export PGN */}
        <Button variant="secondary" size="sm" onClick={handleDownloadPgn} title="Export Repertoire to PGN">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export PGN
        </Button>

        {/* Manual Save Indicator */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveStudy()}
          disabled={isSaving}
          className="text-xs"
        >
          {isSaving ? (
            <>
              <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-1.5" />
              Saving...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Save Changes
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Saved
            </>
          )}
        </Button>

        {/* Practice Mode Link */}
        <Link href={`/studies/${study._id}/train`}>
          <Button variant="amber" size="sm" className="font-semibold shadow-md">
            <GraduationCap className="w-4 h-4 mr-1.5" />
            Practice Repertoire
          </Button>
        </Link>
      </div>
    </div>
  );
}
