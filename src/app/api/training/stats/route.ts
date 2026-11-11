import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { StudyModel } from "@/models/Study";
import { TrainingSessionModel } from "@/models/TrainingSession";
import { Study, TrainingSession } from "@/types/chess";
import { getTreeStatistics } from "@/lib/chess-tree";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isFallback } = await connectDB();
  let studies: Study[] = [];
  let sessions: TrainingSession[] = [];

  if (!isFallback) {
    try {
      const sDocs = await StudyModel.find({ userId: user._id }).lean();
      studies = sDocs.map((s) => ({
        ...s,
        _id: String(s._id),
        nodes: s.nodes instanceof Map ? Object.fromEntries(s.nodes) : s.nodes || {},
      }));

      const sesDocs = await TrainingSessionModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
      sessions = sesDocs.map((s) => ({
        ...s,
        _id: String(s._id),
      }));
    } catch {
      // Fallback
    }
  }

  if (studies.length === 0) {
    studies = localDb.collection<Study>("studies").find({ userId: user._id });
  }
  if (sessions.length === 0) {
    sessions = localDb.collection<TrainingSession>("trainingSessions").find({ userId: user._id });
  }

  let totalVariations = 0;
  for (const study of studies) {
    const stats = getTreeStatistics(study);
    totalVariations += stats.totalVariations;
  }

  const totalMovesPracticed = sessions.reduce((acc, s) => acc + (s.movesTested || 0), 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + (s.correctMoves || 0), 0);
  const overallAccuracy = totalMovesPracticed > 0 ? Math.round((totalCorrect / totalMovesPracticed) * 100) : 0;

  // Find studies needing revision:
  // e.g. studies with low session accuracy or no sessions yet or oldest lastStudiedAt
  const studiesNeedingRevision = studies.map((study) => {
    const studySessions = sessions.filter((s) => s.studyId === study._id);
    const accuracy = studySessions.length > 0
      ? Math.round(studySessions.reduce((acc, s) => acc + s.accuracy, 0) / studySessions.length)
      : 0;

    return {
      study,
      accuracy,
      lastTrained: study.lastStudiedAt,
    };
  }).sort((a, b) => a.accuracy - b.accuracy);

  return NextResponse.json({
    totalStudies: studies.length,
    totalVariations,
    totalSessions: sessions.length,
    overallAccuracy,
    totalMovesPracticed,
    recentSessions: sessions.slice(0, 5),
    studiesNeedingRevision: studiesNeedingRevision.slice(0, 4),
  });
}
