"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrainingBoard } from "@/components/training/TrainingBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";

interface TrainPageProps {
  params: Promise<{ id: string }>;
}

export default function StudyTrainPage({ params }: TrainPageProps) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["study-train", id],
    queryFn: async () => {
      const res = await fetch(`/api/studies/${id}`);
      if (!res.ok) throw new Error("Failed to load study");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Preparing training engine...</p>
      </div>
    );
  }

  if (error || !data?.study) {
    return (
      <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl max-w-md mx-auto my-12">
        <h3 className="text-base font-bold text-red-400">Study Not Found</h3>
        <p className="text-xs text-neutral-400 mt-2">
          Unable to start training session for this study.
        </p>
      </div>
    );
  }

  const study = data.study;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href={`/studies/${study._id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-100">{study.name}</h1>
              <Badge variant={study.color === "white" ? "white" : "black"}>
                {study.color === "white" ? "White Repertoire" : "Black Repertoire"}
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Opening Practice Mode: Test your memory against saved opponent variations.
            </p>
          </div>
        </div>

        <Link href={`/studies/${study._id}`}>
          <Button variant="secondary" size="sm">
            <BookOpen className="w-4 h-4 mr-1.5" />
            Edit Move Tree
          </Button>
        </Link>
      </div>

      {/* Interactive Training Engine */}
      <TrainingBoard study={study} initialMode="guided" />
    </div>
  );
}
