import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, localDb } from "@/lib/db";
import { StudyModel } from "@/models/Study";
import { Study } from "@/types/chess";

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

  if (!isFallback) {
    try {
      const study = await StudyModel.findOne({ _id: id, userId: user._id }).lean();
      if (study) {
        return NextResponse.json({
          study: {
            ...study,
            _id: String(study._id),
            nodes: study.nodes instanceof Map ? Object.fromEntries(study.nodes) : study.nodes || {},
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  const study = localDb.collection<Study>("studies").findById(id);
  if (!study || study.userId !== user._id) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  return NextResponse.json({ study });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const { isFallback } = await connectDB();
  const updatePayload = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  if (!isFallback) {
    try {
      const updated = await StudyModel.findOneAndUpdate(
        { _id: id, userId: user._id },
        { $set: updatePayload },
        { new: true }
      ).lean();

      if (updated) {
        return NextResponse.json({
          success: true,
          study: {
            ...updated,
            _id: String(updated._id),
            nodes: updated.nodes instanceof Map ? Object.fromEntries(updated.nodes) : updated.nodes || {},
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  const existing = localDb.collection<Study>("studies").findById(id);
  if (!existing || existing.userId !== user._id) {
    return NextResponse.json({ error: "Study not found or unauthorized" }, { status: 404 });
  }

  const updated = localDb.collection<Study>("studies").findByIdAndUpdate(id, updatePayload);
  return NextResponse.json({ success: true, study: updated });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { isFallback } = await connectDB();

  if (!isFallback) {
    try {
      const res = await StudyModel.deleteOne({ _id: id, userId: user._id });
      if (res.deletedCount > 0) {
        return NextResponse.json({ success: true, message: "Study deleted successfully" });
      }
    } catch {
      // Fallback
    }
  }

  const existing = localDb.collection<Study>("studies").findById(id);
  if (!existing || existing.userId !== user._id) {
    return NextResponse.json({ error: "Study not found or unauthorized" }, { status: 404 });
  }

  localDb.collection<Study>("studies").findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Study deleted successfully" });
}

