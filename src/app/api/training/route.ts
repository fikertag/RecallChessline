import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { TrainingSessionModel } from "@/models/TrainingSession";
import { StudyModel } from "@/models/Study";
import { TrainingSession, Study } from "@/types/chess";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isFallback } = await connectDB();

  if (!isFallback) {
    try {
      const sessions = await TrainingSessionModel.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      return NextResponse.json({
        sessions: sessions.map((s) => ({
          ...s,
          _id: String(s._id),
        })),
      });
    } catch {
      // Fallback
    }
  }

  const sessions = localDb.collection<TrainingSession>("trainingSessions").find({ userId: user._id });
  sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ sessions: sessions.slice(0, 20) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      studyId,
      studyName,
      mode,
      color,
      movesTested,
      correctMoves,
      incorrectMoves,
      accuracy,
      completed,
      mistakes,
      durationSeconds,
    } = body;

    const sessionId = "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    const now = new Date().toISOString();

    const newSession: TrainingSession = {
      _id: sessionId,
      userId: user._id,
      studyId,
      studyName: studyName || "Study Practice",
      mode: mode || "guided",
      color: color || "white",
      movesTested: movesTested || 0,
      correctMoves: correctMoves || 0,
      incorrectMoves: incorrectMoves || 0,
      accuracy: Math.round(accuracy || 0),
      completed: !!completed,
      mistakes: mistakes || [],
      durationSeconds: durationSeconds || 0,
      createdAt: now,
    };

    const { isFallback } = await connectDB();

    if (!isFallback) {
      try {
        await TrainingSessionModel.create(newSession);
        await StudyModel.findByIdAndUpdate(studyId, { $set: { lastStudiedAt: now } });
        return NextResponse.json({ success: true, session: newSession }, { status: 201 });
      } catch {
        // Fallback
      }
    }

    localDb.collection<TrainingSession>("trainingSessions").create(newSession);
    localDb.collection<Study>("studies").findByIdAndUpdate(studyId, { lastStudiedAt: now });

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record training session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

