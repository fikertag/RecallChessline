import React from "react";
import { BookOpen, GitBranch, GraduationCap, Award } from "lucide-react";

interface StatCardsProps {
  totalStudies: number;
  totalVariations: number;
  totalSessions: number;
  overallAccuracy: number;
}

export function StatCards({
  totalStudies,
  totalVariations,
  totalSessions,
  overallAccuracy,
}: StatCardsProps) {
  const stats = [
    {
      label: "Total Studies",
      value: totalStudies,
      icon: BookOpen,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Opening Variations",
      value: totalVariations,
      icon: GitBranch,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Training Sessions",
      value: totalSessions,
      icon: GraduationCap,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Overall Accuracy",
      value: `${overallAccuracy}%`,
      icon: Award,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-5 bg-card text-card-foreground border border-border rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {item.label}
                </span>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {item.value}
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
