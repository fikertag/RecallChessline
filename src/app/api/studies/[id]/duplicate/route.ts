import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { StudyModel } from "@/models/Study";
import { Study } from "@/types/chess";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { isFallback } = await connectDB();

  let original: Study | null = null;

  if (!isFallback) {
    try {
      const doc = await StudyModel.findOne({ _id: id, userId: user._id }).lean();
      if (doc) {
        original = {
          ...doc,
          _id: String(doc._id),
          nodes: doc.nodes instanceof Map ? Object.fromEntries(doc.nodes) : doc.nodes || {},
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!original) {
    original = localDb.collection<Study>("studies").findById(id);
  }

  if (!original || original.userId !== user._id) {
    return NextResponse.json({ error: "Original study not found" }, { status: 404 });
  }

  const newId = "study_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
  const now = new Date().toISOString();

  const duplicatedStudy: Study = {
    ...original,
    _id: newId,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    lastStudiedAt: now,
  };

  if (!isFallback) {
    try {
      await StudyModel.create(duplicatedStudy);
      return NextResponse.json({ success: true, study: duplicatedStudy }, { status: 201 });
    } catch {
      // Fallback
    }
  }

  localDb.collection<Study>("studies").create(duplicatedStudy);
  return NextResponse.json({ success: true, study: duplicatedStudy }, { status: 201 });
}
