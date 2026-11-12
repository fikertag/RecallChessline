import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { StudyModel } from "@/models/Study";
import { Study } from "@/types/chess";
import { STARTING_FEN } from "@/lib/chess-tree";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isFallback } = await connectDB();

  if (!isFallback) {
    try {
      const studies = await StudyModel.find({ userId: user._id }).sort({ updatedAt: -1 }).lean();
      return NextResponse.json({
        studies: studies.map((s) => ({
          ...s,
          _id: String(s._id),
          nodes: s.nodes instanceof Map ? Object.fromEntries(s.nodes) : s.nodes || {},
        })),
      });
    } catch {
      // Fallback
    }
  }

  const studies = localDb.collection<Study>("studies").find({ userId: user._id });
  studies.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return NextResponse.json({ studies });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, color, openingName, startingFen, videoUrl, tags } = body;

    if (!name || !color) {
      return NextResponse.json({ error: "Study name and color are required." }, { status: 400 });
    }

    const studyId = "study_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    const now = new Date().toISOString();

    const newStudy: Study = {
      _id: studyId,
      userId: user._id,
      name: name.trim(),
      description: description?.trim() || "",
      color: color === "black" ? "black" : "white",
      openingName: (openingName || name).trim(),
      startingFen: startingFen?.trim() || STARTING_FEN,
      rootNodeIds: [],
      nodes: {},
      videoUrl: videoUrl?.trim() || "",
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
      lastStudiedAt: now,
    };

    const { isFallback } = await connectDB();

    if (!isFallback) {
      try {
        await StudyModel.create(newStudy);
        return NextResponse.json({ success: true, study: newStudy }, { status: 201 });
      } catch {
        // Fallback
      }
    }

    localDb.collection<Study>("studies").create(newStudy);
    return NextResponse.json({ success: true, study: newStudy }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create study";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

