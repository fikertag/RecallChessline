import mongoose, { Schema, Document, Model } from "mongoose";
import { Study as IStudyType } from "@/types/chess";

export interface IStudyDocument extends Omit<IStudyType, "_id">, Document {}

const MoveNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    parentId: { type: String, default: null },
    children: [{ type: String }],
    san: { type: String, required: true },
    uci: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    promotion: { type: String },
    fen: { type: String, required: true },
    turn: { type: String, enum: ["w", "b"], required: true },
    moveNumber: { type: Number, required: true },
    comment: { type: String, default: "" },
    annotation: { type: String, default: "" },
    videoTimestamp: { type: Number },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    lastTrained: { type: String },
  },
  { _id: false }
);

const StudySchema = new Schema<IStudyDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    color: { type: String, enum: ["white", "black"], required: true },
    openingName: { type: String, required: true, trim: true },
    startingFen: {
      type: String,
      default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    rootNodeIds: [{ type: String }],
    nodes: {
      type: Map,
      of: MoveNodeSchema,
      default: {},
    },
    videoUrl: { type: String, default: "" },
    tags: [{ type: String }],
    lastStudiedAt: { type: String },
  },
  { timestamps: true }
);

export const StudyModel: Model<IStudyDocument> =
  mongoose.models.Study || mongoose.model<IStudyDocument>("Study", StudySchema);

