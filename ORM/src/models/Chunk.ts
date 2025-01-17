import mongoose, { Document, Schema } from "mongoose";

export interface IChunk extends Document {
  chunk_id: string;
  video_id: string;
  blob_path: string;
  hash: string;
}

const chunkSchema = new Schema<IChunk>({
  chunk_id: { type: String, required: true, unique: true },
  video_id: { type: String, required: true },
  blob_path: { type: String, required: true },
  hash: { type: String, required: true },
});

export const Chunk = mongoose.model<IChunk>("Chunk", chunkSchema);
