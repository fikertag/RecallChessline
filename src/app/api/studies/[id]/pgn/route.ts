import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { StudyModel } from "@/models/Study";
import { Study } from "@/types/chess";
import { exportStudyToPgn, addMoveToTree, STARTING_FEN } from "@/lib/chess-tree";
import { Chess } from "chess.js";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { isFallback } = await connectDB();

  let study: Study | null = null;
  if (!isFallback) {
    try {
      const doc = await StudyModel.findOne({ _id: id, userId: user._id }).lean();
      if (doc) {
        study = {
          ...doc,
          _id: String(doc._id),
          nodes: doc.nodes instanceof Map ? Object.fromEntries(doc.nodes) : doc.nodes || {},
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!study) {
    study = localDb.collection<Study>("studies").findById(id);
  }

  if (!study || study.userId !== user._id) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  const pgn = exportStudyToPgn(study);

  return new Response(pgn, {
    headers: {
      "Content-Type": "application/x-chess-pgn",
      "Content-Disposition": `attachment; filename="${study.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.pgn"`,
    },
  });
}

/**
 * Imports PGN moves (mainline + basic variations) into the study tree without overwriting existing variations.
 */
export async function POST(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { pgn } = body;

  if (!pgn || typeof pgn !== "string") {
    return NextResponse.json({ error: "PGN text is required." }, { status: 400 });
  }

  const { isFallback } = await connectDB();
  let study: Study | null = null;

  if (!isFallback) {
    try {
      const doc = await StudyModel.findOne({ _id: id, userId: user._id }).lean();
      if (doc) {
        study = {
          ...doc,
          _id: String(doc._id),
          nodes: doc.nodes instanceof Map ? Object.fromEntries(doc.nodes) : doc.nodes || {},
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!study) {
    study = localDb.collection<Study>("studies").findById(id);
  }

  if (!study || study.userId !== user._id) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  try {
    const chess = new Chess(study.startingFen || STARTING_FEN);
    chess.loadPgn(pgn);

    // Replay moves into study tree
    const history = chess.history({ verbose: true });
    let currentParentId: string | null = null;
    let workingStudy = { ...study };

    for (const move of history) {
      const res = addMoveToTree(workingStudy, currentParentId, {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      workingStudy = res.updatedStudy;
      currentParentId = res.nodeId;
    }

    // Save updated study
    if (!isFallback) {
      try {
        await StudyModel.findByIdAndUpdate(id, { $set: workingStudy });
      } catch {
        localDb.collection<Study>("studies").findByIdAndUpdate(id, workingStudy);
      }
    } else {
      localDb.collection<Study>("studies").findByIdAndUpdate(id, workingStudy);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${history.length} moves into repertoire.`,
      study: workingStudy,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid PGN format";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
