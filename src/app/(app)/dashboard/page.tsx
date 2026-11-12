"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentStudiesList } from "@/components/dashboard/RecentStudiesList";
import { StudiesNeedingRevision } from "@/components/dashboard/StudiesNeedingRevision";
import { CreateStudyModal } from "@/components/study/CreateStudyModal";
import { BookOpen, AlertCircle, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/training/stats");
      if (!res.ok) throw new Error("Failed to load dashboard stats");
      return res.json();
    },
  });

  const { data: studiesData, refetch: refetchStudies } = useQuery({
    queryKey: ["my-studies"],
    queryFn: async () => {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error("Failed to load studies");
      return res.json();
    },
  });

  const studies = studiesData?.studies || [];
  const stats = statsData || {
    totalStudies: studies.length,
    totalVariations: 0,
    totalSessions: 0,
    overallAccuracy: 0,
    studiesNeedingRevision: [],
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Repertoire Command Center
            </h1>
            <span className="p-1 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Build branching opening trees and train through active recall.
          </p>
        </div>

        <QuickActions onOpenCreateStudy={() => setIsCreateOpen(true)} />
      </div>

      {/* KPI Stats Grid */}
      <StatCards
        totalStudies={stats.totalStudies}
        totalVariations={stats.totalVariations}
        totalSessions={stats.totalSessions}
        overallAccuracy={stats.overallAccuracy}
      />

      {/* 2-Column Section: Recently Studied & Needs Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recently Studied Openings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Active Opening Repertoires
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {studies.length} {studies.length === 1 ? "study" : "studies"}
            </span>
          </div>

          <RecentStudiesList studies={studies} />
        </div>

        {/* Right: Studies Needing Revision (Spaced Repetition) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Need Revision
            </h2>
          </div>

          <StudiesNeedingRevision items={stats.studiesNeedingRevision || []} />
        </div>
      </div>

      {/* Create Study Modal */}
      <CreateStudyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          refetchStudies();
          refetchStats();
        }}
      />
    </div>
  );
}

