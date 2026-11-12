"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Study, ChessColor } from "@/types/chess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateStudyModal } from "@/components/study/CreateStudyModal";
import { getTreeStatistics } from "@/lib/chess-tree";
import { formatTimeAgo } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  Search,
  GitBranch,
  GraduationCap,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export default function StudiesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<"all" | ChessColor>("all");
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-studies-list"],
    queryFn: async () => {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error("Failed to load studies");
      return res.json();
    },
  });

  const studies: Study[] = data?.studies || [];

  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      const matchesColor =
        colorFilter === "all" || study.color === colorFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        study.name.toLowerCase().includes(q) ||
        study.openingName.toLowerCase().includes(q) ||
        (study.tags && study.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesColor && matchesSearch;
    });
  }, [studies, colorFilter, searchQuery]);

  const handleDuplicate = async (studyId: string) => {
    try {
      const res = await fetch(`/api/studies/${studyId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        refetch();
      }
    } catch (err) {
      console.error("Duplicate failed", err);
    }
  };

  const handleDelete = async () => {
    if (!studyToDelete) return;
    try {
      const res = await fetch(`/api/studies/${studyToDelete._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudyToDelete(null);
        refetch();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            My Opening Studies
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize, branch, and refine your personal opening repertoires.
          </p>
        </div>

        <Button variant="amber" onClick={() => setIsCreateOpen(true)} className="font-semibold">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Study
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card text-card-foreground border border-border rounded-xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search studies or openings..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setColorFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              colorFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({studies.length})
          </button>
          <button
            onClick={() => setColorFilter("white")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              colorFilter === "white"
                ? "bg-neutral-100 text-neutral-900 border border-neutral-300 dark:bg-neutral-200 dark:text-neutral-950"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            White ({studies.filter((s) => s.color === "white").length})
          </button>
          <button
            onClick={() => setColorFilter("black")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              colorFilter === "black"
                ? "bg-neutral-900 text-neutral-100 border border-primary dark:bg-neutral-950"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Black ({studies.filter((s) => s.color === "black").length})
          </button>
        </div>
      </div>

      {/* Studies Grid */}
      {filteredStudies.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-base font-semibold text-foreground">No Studies Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No studies matching "${searchQuery}". Try clearing the search.`
              : "Get started by creating your first opening repertoire."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudies.map((study) => {
            const stats = getTreeStatistics(study);

            return (
              <div
                key={study._id}
                className="flex flex-col justify-between p-5 bg-card text-card-foreground border border-border hover:border-primary/40 rounded-xl transition-all group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={study.color === "white" ? "white" : "black"}>
                      {study.color === "white" ? "White" : "Black"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatTimeAgo(study.lastStudiedAt || study.updatedAt)}
                    </span>
                  </div>

                  <Link href={`/studies/${study._id}`}>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {study.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                    {study.description || `Repertoire for ${study.openingName}.`}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono text-primary">
                      <GitBranch className="w-3.5 h-3.5" />
                      {stats.totalVariations} lines
                    </span>
                    <span>•</span>
                    <span>{stats.totalNodes} total moves</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Link href={`/studies/${study._id}`}>
                      <Button variant="default" size="sm" className="text-xs">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        Open Tree
                      </Button>
                    </Link>

                    <Link href={`/studies/${study._id}/train`}>
                      <Button variant="secondary" size="sm" className="text-xs text-primary">
                        <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                        Train
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(study._id)}
                      title="Duplicate Study"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStudyToDelete(study)}
                      title="Delete Study"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!studyToDelete}
        onClose={() => setStudyToDelete(null)}
        title="Delete Opening Study?"
        description={`Are you sure you want to delete "${studyToDelete?.name}"? All variations and annotations will be permanently removed.`}
        maxWidth="sm"
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" size="sm" onClick={() => setStudyToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Study
          </Button>
        </div>
      </Dialog>

      {/* Create Study Modal */}
      <CreateStudyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

