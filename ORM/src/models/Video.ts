import mongoose, { Document, Schema } from "mongoose";
import { IChunk } from "./Chunk";
import { ISharedLink } from "./SharedLink";

export interface IVideo extends Document {
  video_id: string;
  title: string;
  description?: string;
  owner_id: string;
  visibility: "Public" | "Private" | "Shared";
  created_at: Date;
  updated_at: Date;
  chunks: IChunk[];
  shared_links: ISharedLink[];
}

const videoSchema = new Schema<IVideo>({
  video_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  owner_id: { type: String, required: true },
  visibility: {
    type: String,
    enum: ["Public", "Private", "Shared"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  chunks: [{ type: Schema.Types.ObjectId, ref: "Chunk" }],
  shared_links: [{ type: Schema.Types.ObjectId, ref: "SharedLink" }],
});

export const Video = mongoose.model<IVideo>("Video", videoSchema);
