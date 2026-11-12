import mongoose, { Schema, Model } from "mongoose";
import { TrainingSession as ITrainingSessionType } from "@/types/chess";

export interface ITrainingSessionDocument extends ITrainingSessionType {}

const TrainingMistakeSchema = new Schema(
  {
    fen: { type: String, required: true },
    expectedSan: { type: String, required: true },
    playedSan: { type: String, required: true },
    nodeId: { type: String, required: true },
    comment: { type: String },
  },
  { _id: false }
);

const TrainingSessionSchema = new Schema<ITrainingSessionDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    studyId: { type: String, required: true, index: true },
    studyName: { type: String },
    mode: { type: String, enum: ["guided", "recall"], required: true },
    color: { type: String, enum: ["white", "black"], required: true },
    movesTested: { type: Number, default: 0 },
    correctMoves: { type: Number, default: 0 },
    incorrectMoves: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    mistakes: [TrainingMistakeSchema],
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TrainingSessionModel: Model<ITrainingSessionDocument> =
  mongoose.models.TrainingSession ||
  mongoose.model<ITrainingSessionDocument>("TrainingSession", TrainingSessionSchema);

