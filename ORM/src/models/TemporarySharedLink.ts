import mongoose, { Document, Schema } from "mongoose";

export interface ITemporarySharedLink extends Document {
  link_id: mongoose.Schema.Types.ObjectId;
  video_id: mongoose.Schema.Types.ObjectId;
  viewer_id?: mongoose.Schema.Types.ObjectId;
  expires_at: Date;
}

const temporarySharedLinkSchema = new Schema<ITemporarySharedLink>({
  link_id: { type: Schema.Types.ObjectId, required: true, unique: true },
  video_id: { type: Schema.Types.ObjectId, required: true, ref: "Video" },
  viewer_id: { type: Schema.Types.ObjectId, ref: "User" },
  expires_at: { type: Date, required: true },
});

export const TemporarySharedLink = mongoose.model<ITemporarySharedLink>(
  "TemporarySharedLink",
  temporarySharedLinkSchema
);
