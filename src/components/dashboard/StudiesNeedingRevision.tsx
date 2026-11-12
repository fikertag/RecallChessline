import React from "react";
import Link from "next/link";
import { Study } from "@/types/chess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, GraduationCap } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface RevisionItem {
  study: Study;
  accuracy: number;
  lastTrained?: string;
}

interface StudiesNeedingRevisionProps {
  items: RevisionItem[];
}

export function StudiesNeedingRevision({ items }: StudiesNeedingRevisionProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 bg-card text-card-foreground border border-border rounded-xl text-center text-xs text-muted-foreground">
        All repertoires are up to date! Great consistency.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ study, accuracy, lastTrained }) => (
        <div
          key={study._id}
          className="flex items-center justify-between p-3.5 bg-card text-card-foreground border border-border hover:border-primary/40 rounded-xl transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/studies/${study._id}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {study.name}
                </Link>
                <Badge variant={study.color === "white" ? "white" : "black"}>
                  {study.color}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>Accuracy: <strong className={accuracy < 70 ? "text-destructive" : "text-amber-500"}>{accuracy}%</strong></span>
                <span>•</span>
                <span>Last reviewed: {formatTimeAgo(lastTrained)}</span>
              </div>
            </div>
          </div>

          <Link href={`/studies/${study._id}/train`}>
            <Button variant="secondary" size="sm" className="text-xs">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Practice
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
