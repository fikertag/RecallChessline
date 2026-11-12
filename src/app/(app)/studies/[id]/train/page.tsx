"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TrainingBoard } from "@/components/training/TrainingBoard";
import { LineStrategy } from "@/lib/training-engine";

interface TrainPageProps {
  params: Promise<{ id: string }>;
}

function TrainContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const rawStrategy = searchParams.get("strategy");
  const rawLineId = searchParams.get("lineId") || undefined;

  const validStrategies: LineStrategy[] = ["longest", "random", "manual"];
  const strategy: LineStrategy =
    rawStrategy && validStrategies.includes(rawStrategy as LineStrategy)
      ? (rawStrategy as LineStrategy)
      : "random";

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
        <p className="text-xs text-muted-foreground">Preparing training engine...</p>
      </div>
    );
  }

  if (error || !data?.study) {
    return (
      <div className="p-8 text-center bg-card text-card-foreground border border-border rounded-xl max-w-md mx-auto my-12">
        <h3 className="text-base font-bold text-destructive">Study Not Found</h3>
        <p className="text-xs text-muted-foreground mt-2">
          Unable to start training session for this study.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Interactive Training Arena: Board on left, all Study & Stats UIs on the side */}
      <TrainingBoard
        study={data.study}
        initialMode="guided"
        initialStrategy={strategy}
        initialLineId={rawLineId}
      />
    </div>
  );
}

export default function StudyTrainPage({ params }: TrainPageProps) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading practice arena...</p>
        </div>
      }
    >
      <TrainContent id={id} />
    </Suspense>
  );
}
