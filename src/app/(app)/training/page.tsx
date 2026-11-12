"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Study, TrainingSession } from "@/types/chess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo, formatDate } from "@/lib/utils";
import { getTreeStatistics } from "@/lib/chess-tree";
import {
  GraduationCap,
  Play,
  History,
  Target,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";

export default function TrainingHubPage() {
  const { data: studiesData, isLoading: isStudiesLoading } = useQuery({
    queryKey: ["training-hub-studies"],
    queryFn: async () => {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error("Failed to load studies");
      return res.json();
    },
  });

  const { data: sessionsData, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["training-hub-sessions"],
    queryFn: async () => {
      const res = await fetch("/api/training");
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
  });

  const studies: Study[] = studiesData?.studies || [];
  const sessions: TrainingSession[] = sessionsData?.sessions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Training Hub & Practice Arena
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Select an opening repertoire to practice against saved variations through active recall.
        </p>
      </div>

      {/* Select Study for Training */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Select Repertoire to Train
          </h2>
        </div>

        {studies.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground text-xs">
            No opening studies available to practice. Create a study first!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studies.map((study) => {
              const stats = getTreeStatistics(study);

              return (
                <div
                  key={study._id}
                  className="p-5 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={study.color === "white" ? "white" : "black"}>
                        {study.color === "white" ? "White" : "Black"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {stats.totalVariations} lines
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {study.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {study.description || `Opening preparation for ${study.openingName}.`}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Last tested: {formatTimeAgo(study.lastStudiedAt)}
                    </span>

                    <Link href={`/studies/${study._id}/train`}>
                      <Button variant="amber" size="sm" className="font-semibold text-xs">
                        <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                        Train Now
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Training History & Recent Performance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Recent Practice History
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground text-xs">
            No training sessions completed yet. Practice your first opening above!
          </div>
        ) : (
          <div className="overflow-hidden bg-card border border-border rounded-xl shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="p-3.5">Repertoire</th>
                    <th className="p-3.5">Mode</th>
                    <th className="p-3.5">Accuracy</th>
                    <th className="p-3.5">Moves</th>
                    <th className="p-3.5">Mistakes</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {sessions.map((sess) => (
                    <tr key={sess._id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-3.5 font-semibold text-foreground">
                        {sess.studyName || "Repertoire Practice"}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground border border-border">
                          {sess.mode}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold">
                        <span
                          className={
                            sess.accuracy >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : sess.accuracy >= 60
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-destructive"
                          }
                        >
                          {sess.accuracy}%
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">{sess.movesTested}</td>
                      <td className="p-3.5 font-mono text-destructive">{sess.incorrectMoves}</td>
                      <td className="p-3.5 text-muted-foreground">{formatTimeAgo(sess.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

