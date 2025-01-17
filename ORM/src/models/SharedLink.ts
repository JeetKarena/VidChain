import mongoose, { Document, Schema } from "mongoose";

export interface ISharedLink extends Document {
  link_id: string;
  video_id: string;
  expiry_date: Date;
  viewer_id?: string;
}

const sharedLinkSchema = new Schema<ISharedLink>({
  link_id: { type: String, required: true, unique: true },
  video_id: { type: String, required: true },
  expiry_date: { type: Date, required: true },
  viewer_id: { type: String },
});

export const SharedLink = mongoose.model<ISharedLink>(
  "SharedLink",
  sharedLinkSchema
);
