import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IChunk } from "./Chunk";
import { ISharedLink } from "./SharedLink";
import { v4 as uuidv4 } from "uuid";

export interface IVideo extends Document {
  video_id: string;
  title: string;
  description?: string;
  owner: IUser["_id"]; // Reference to User
  visibility: "Public" | "Private" | "Shared";
  created_at: Date;
  updated_at: Date;
  chunks: IChunk[];
  shared_links: ISharedLink[];
}

const videoSchema = new Schema<IVideo>(
  {
    video_id: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    title: { type: String, required: true },
    description: { type: String },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["Public", "Private", "Shared"],
      default: "Private",
      required: true,
    },
    chunks: [{ type: Schema.Types.ObjectId, ref: "Chunk" }],
    shared_links: [{ type: Schema.Types.ObjectId, ref: "SharedLink" }],
  },
  { timestamps: true }
);

export const Video = mongoose.model<IVideo>("Video", videoSchema);
