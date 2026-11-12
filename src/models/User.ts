import mongoose, { Schema, Document, Model } from "mongoose";
import { User as IUserType } from "@/types/auth";

export interface IUserDocument extends Omit<IUserType, "_id">, Document {
  passwordHash: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    emailVerified: { type: Boolean, default: false },
    preferences: {
      boardTheme: { type: String, default: "classic" },
      pieceSet: { type: String, default: "standard" },
      soundEnabled: { type: Boolean, default: true },
      showCoordinates: { type: Boolean, default: true },
      autoFlip: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

