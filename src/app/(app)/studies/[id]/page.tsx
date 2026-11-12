"use client";

import React, { useEffect, useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStudyStore } from "@/store/study-store";
import { useBoardStore } from "@/store/board-store";
import { ChessboardView } from "@/components/chess/ChessboardView";
import { MoveControls } from "@/components/chess/MoveControls";
import { MoveTreeVisualizer } from "@/components/chess/MoveTreeVisualizer";
import { MoveCommentary } from "@/components/study/MoveCommentary";
import { StudyHeader } from "@/components/study/StudyHeader";
import { LineStudySelector } from "@/components/study/LineStudySelector";
import { NodeAnnotationModal } from "@/components/chess/NodeAnnotationModal";
import { VideoReferenceModal } from "@/components/study/VideoReferenceModal";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params);

  const { study, currentFen, setStudy, playMove, currentNodeId } = useStudyStore();
  const { setOrientation } = useBoardStore();

  const [annotatingNodeId, setAnnotatingNodeId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoTimestampSeconds, setVideoTimestampSeconds] = useState(0);

  // Fetch study data
  const { data, isLoading, error } = useQuery({
    queryKey: ["study", id],
    queryFn: async () => {
      const res = await fetch(`/api/studies/${id}`);
      if (!res.ok) throw new Error("Failed to load study");
      return res.json();
    },
  });

  // Set active study in Zustand store and synchronize orientation
  useEffect(() => {
    if (data?.study) {
      setStudy(data.study);
      setOrientation(data.study.color);
    }
  }, [data, setStudy, setOrientation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading opening study & variations...</p>
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="p-8 text-center bg-card text-card-foreground border border-border rounded-xl max-w-md mx-auto my-12">
        <h3 className="text-base font-bold text-destructive">Study Not Found</h3>
        <p className="text-xs text-muted-foreground mt-2">
          This study could not be loaded or you do not have permission to access it.
        </p>
      </div>
    );
  }

  const currentNode = currentNodeId ? study.nodes[currentNodeId] : null;
  const lastMove = currentNode
    ? { from: currentNode.from, to: currentNode.to }
    : null;

  const handleBoardMove = (move: { from: string; to: string; promotion?: string }) => {
    playMove(move);
  };

  const handleOpenVideoAtTimestamp = (seconds: number) => {
    setVideoTimestampSeconds(seconds);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Study Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Compact Interactive Chessboard & Controls */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <ChessboardView
            fen={currentFen}
            onMove={handleBoardMove}
            interactive={true}
            lastMove={lastMove}
          />

          <MoveControls
            onOpenAnnotationModal={() => {
              if (currentNodeId) setAnnotatingNodeId(currentNodeId);
            }}
          />
        </div>

        {/* Right: Study Header + Line Study Selector + Move Commentary & Visual Branching Tree */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Integrated Study Header & Actions (At the side instead of stretching across the top) */}
          <StudyHeader onOpenVideoModal={() => setIsVideoModalOpen(true)} />

          {/* Option to study which line from the tree: longest, random, or manual */}
          <LineStudySelector study={study} />

          {/* Active Move Commentary & Candidate Moves */}
          <MoveCommentary
            onOpenAnnotationModal={(nodeId) => setAnnotatingNodeId(nodeId)}
            onOpenVideoAtTimestamp={handleOpenVideoAtTimestamp}
          />

          {/* Visual Branching Opening Tree */}
          <MoveTreeVisualizer
            onOpenAnnotationModal={(nodeId) => setAnnotatingNodeId(nodeId)}
          />
        </div>
      </div>

      {/* Annotation Modal */}
      <NodeAnnotationModal
        isOpen={!!annotatingNodeId}
        nodeId={annotatingNodeId}
        onClose={() => setAnnotatingNodeId(null)}
      />

      {/* Video Reference Modal */}
      <VideoReferenceModal
        isOpen={isVideoModalOpen}
        videoUrl={study.videoUrl}
        initialSeconds={videoTimestampSeconds}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
}
