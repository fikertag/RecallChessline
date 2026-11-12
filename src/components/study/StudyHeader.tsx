"use client";

import React from "react";
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
import { cn } from "@/lib/utils";

interface StudyHeaderProps {
  onOpenVideoModal?: () => void;
  className?: string;
}

export function StudyHeader({ onOpenVideoModal, className }: StudyHeaderProps) {
  const router = useRouter();
  const { study, isSaving, hasUnsavedChanges, saveStudy } = useStudyStore();

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
    <div
      className={cn(
        "flex flex-col gap-3 p-4 bg-card text-card-foreground border border-border rounded-xl shadow-xs",
        className
      )}
    >
      {/* Top row: Title & Color */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/studies">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              title="Back to Studies"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-foreground truncate">{study.name}</h1>
              <Badge variant={study.color === "white" ? "white" : "black"}>
                {study.color === "white" ? "White" : "Black"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Opening: <span className="text-foreground font-medium">{study.openingName}</span>
              {study.tags && study.tags.length > 0 ? (
                <span className="ml-1.5 text-muted-foreground">• {study.tags.join(", ")}</span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Practice Repertoire primary CTA */}
        <Link href={`/studies/${study._id}/train`} className="shrink-0">
          <Button variant="amber" size="sm" className="font-semibold shadow-xs text-xs">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Train Repertoire
          </Button>
        </Link>
      </div>

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
        {/* Save indicator */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveStudy()}
          disabled={isSaving}
          className="text-xs h-8 px-2.5"
        >
          {isSaving ? (
            <>
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1.5" />
              Saving...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Save
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              Saved
            </>
          )}
        </Button>

        {/* Video reference */}
        {study.videoUrl && onOpenVideoModal ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenVideoModal}
            className="text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs h-8 px-2.5"
          >
            <Video className="w-3.5 h-3.5 mr-1.5" />
            Video
          </Button>
        ) : null}

        {/* Duplicate */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDuplicate}
          title="Duplicate this study"
          className="text-xs h-8 px-2.5"
        >
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          Duplicate
        </Button>

        {/* Export PGN */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadPgn}
          title="Export Repertoire to PGN"
          className="text-xs h-8 px-2.5"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export PGN
        </Button>
      </div>
    </div>
  );
}
