"use client";

import { create } from "zustand";
import { Study, MoveNode, MoveAnnotation } from "@/types/chess";
import {
  addMoveToTree,
  deleteNodeAndSubtree,
  getFenAtNode,
  updateNodeMetadata,
  STARTING_FEN,
} from "@/lib/chess-tree";
import { sounds } from "@/lib/sound";

interface StudyStore {
  study: Study | null;
  currentNodeId: string | null;
  currentFen: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setStudy: (study: Study) => void;
  setCurrentNodeId: (nodeId: string | null) => void;
  playMove: (move: { from: string; to: string; promotion?: string }) => {
    success: boolean;
    nodeId?: string;
    isNewBranch?: boolean;
    error?: string;
  };
  deleteBranch: (nodeId: string) => void;
  updateAnnotation: (nodeId: string, annotation: MoveAnnotation) => void;
  updateComment: (nodeId: string, comment: string) => void;
  updateVideoTimestamp: (nodeId: string, timestamp: number) => void;

  // Navigation
  goToStart: () => void;
  goBack: () => void;
  goForward: () => void;
  selectVariation: (nodeId: string) => void;
  saveStudy: () => Promise<boolean>;
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  study: null,
  currentNodeId: null,
  currentFen: STARTING_FEN,
  isSaving: false,
  hasUnsavedChanges: false,

  setStudy: (study) => {
    // Select first root move if available, else start at starting position
    const firstRoot = study.rootNodeIds.length > 0 ? study.rootNodeIds[0] : null;
    const initialFen = firstRoot && study.nodes[firstRoot]
      ? study.nodes[firstRoot].fen
      : study.startingFen || STARTING_FEN;

    set({
      study,
      currentNodeId: firstRoot,
      currentFen: initialFen,
      hasUnsavedChanges: false,
    });
  },

  setCurrentNodeId: (nodeId) => {
    const { study } = get();
    if (!study) return;
    const fen = getFenAtNode(study, nodeId);
    set({ currentNodeId: nodeId, currentFen: fen });
  },

  playMove: (move) => {
    const { study, currentNodeId } = get();
    if (!study) return { success: false, error: "No active study." };

    try {
      const { updatedStudy, nodeId, isNewBranch } = addMoveToTree(study, currentNodeId, move);
      const nextFen = getFenAtNode(updatedStudy, nodeId);

      sounds.playMove();

      set({
        study: updatedStudy,
        currentNodeId: nodeId,
        currentFen: nextFen,
        hasUnsavedChanges: true,
      });

      // Auto-save changes in background
      setTimeout(() => {
        get().saveStudy();
      }, 500);

      return { success: true, nodeId, isNewBranch };
    } catch (err: unknown) {
      sounds.playIncorrect();
      const message = err instanceof Error ? err.message : "Illegal move";
      return { success: false, error: message };
    }
  },

  deleteBranch: (nodeId) => {
    const { study } = get();
    if (!study) return;

    const { updatedStudy, fallbackNodeId } = deleteNodeAndSubtree(study, nodeId);
    const nextFen = getFenAtNode(updatedStudy, fallbackNodeId);

    set({
      study: updatedStudy,
      currentNodeId: fallbackNodeId,
      currentFen: nextFen,
      hasUnsavedChanges: true,
    });

    get().saveStudy();
  },

  updateAnnotation: (nodeId, annotation) => {
    const { study } = get();
    if (!study) return;
    const updated = updateNodeMetadata(study, nodeId, { annotation });
    set({ study: updated, hasUnsavedChanges: true });
    get().saveStudy();
  },

  updateComment: (nodeId, comment) => {
    const { study } = get();
    if (!study) return;
    const updated = updateNodeMetadata(study, nodeId, { comment });
    set({ study: updated, hasUnsavedChanges: true });
    get().saveStudy();
  },

  updateVideoTimestamp: (nodeId, videoTimestamp) => {
    const { study } = get();
    if (!study) return;
    const updated = updateNodeMetadata(study, nodeId, { videoTimestamp });
    set({ study: updated, hasUnsavedChanges: true });
    get().saveStudy();
  },

  goToStart: () => {
    const { study } = get();
    if (!study) return;
    set({
      currentNodeId: null,
      currentFen: study.startingFen || STARTING_FEN,
    });
  },

  goBack: () => {
    const { study, currentNodeId } = get();
    if (!study || !currentNodeId) return;
    const currNode = study.nodes[currentNodeId];
    if (!currNode) return;

    const parentId = currNode.parentId;
    const fen = getFenAtNode(study, parentId);
    set({ currentNodeId: parentId, currentFen: fen });
  },

  goForward: () => {
    const { study, currentNodeId } = get();
    if (!study) return;

    const children = currentNodeId
      ? study.nodes[currentNodeId]?.children || []
      : study.rootNodeIds;

    if (children.length > 0) {
      const nextId = children[0]; // Follow primary mainline
      const fen = getFenAtNode(study, nextId);
      set({ currentNodeId: nextId, currentFen: fen });
    }
  },

  selectVariation: (nodeId) => {
    const { study } = get();
    if (!study || !study.nodes[nodeId]) return;
    const fen = getFenAtNode(study, nodeId);
    set({ currentNodeId: nodeId, currentFen: fen });
  },

  saveStudy: async () => {
    const { study } = get();
    if (!study) return false;

    set({ isSaving: true });
    try {
      const res = await fetch(`/api/studies/${study._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(study),
      });

      if (!res.ok) throw new Error("Failed to save study");
      set({ isSaving: false, hasUnsavedChanges: false });
      return true;
    } catch (err) {
      console.error("Save error:", err);
      set({ isSaving: false });
      return false;
    }
  },
}));
