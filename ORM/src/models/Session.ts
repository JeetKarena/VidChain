import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
  session_id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  token: string;
  expires_at: Date;
  created_at: Date;
}

const sessionSchema = new Schema<ISession>({
  session_id: { type: Schema.Types.ObjectId, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);
