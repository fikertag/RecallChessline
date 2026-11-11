import React from "react";
import Link from "next/link";
import { Study } from "@/types/chess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTreeStatistics } from "@/lib/chess-tree";
import { formatTimeAgo } from "@/lib/utils";
import { GitBranch, GraduationCap, ChevronRight, BookOpen } from "lucide-react";

interface RecentStudiesListProps {
  studies: Study[];
}

export function RecentStudiesList({ studies }: RecentStudiesListProps) {
  if (studies.length === 0) {
    return (
      <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl">
        <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-neutral-300">No Studies Created Yet</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Start by creating your first opening repertoire or exploring the starter studies.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {studies.map((study) => {
        const stats = getTreeStatistics(study);

        return (
          <div
            key={study._id}
            className="flex flex-col justify-between p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={study.color === "white" ? "white" : "black"}>
                  {study.color === "white" ? "White" : "Black"}
                </Badge>
                <span className="text-[11px] text-neutral-500">
                  {formatTimeAgo(study.lastStudiedAt || study.updatedAt)}
                </span>
              </div>

              <Link href={`/studies/${study._id}`}>
                <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {study.name}
                </h3>
              </Link>

              <p className="text-xs text-neutral-400 mt-1 line-clamp-2 min-h-[32px]">
                {study.description || `Repertoire for ${study.openingName}.`}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                <span>{stats.totalVariations} variations</span>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/studies/${study._id}/train`}>
                  <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-amber-300">
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    Train
                  </Button>
                </Link>

                <Link href={`/studies/${study._id}`}>
                  <Button variant="secondary" size="icon" className="h-7 w-7 text-neutral-300">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
