import { IChunk, Chunk } from "../../models/Chunk";

const chunkResolver = {
  Query: {
    getChunk: async (
      _: any,
      { id }: { id: string }
    ): Promise<IChunk | null> => {
      return await Chunk.findById(id);
    },
    getAllChunks: async (
      _: any,
      { video_id }: { video_id: string }
    ): Promise<IChunk[]> => {
      return await Chunk.find({ video_id });
    },
  },
  Mutation: {
    createChunk: async (
      _: any,
      {
        input,
      }: {
        input: {
          chunk_id: string;
          video_id: string;
          blob_path: string;
          hash: string;
        };
      }
    ): Promise<IChunk> => {
      const { chunk_id, video_id, blob_path, hash } = input;
      const chunk = new Chunk({ chunk_id, video_id, blob_path, hash });
      return await chunk.save();
    },
    deleteChunk: async (_: any, { id }: { id: string }): Promise<boolean> => {
      const result = await Chunk.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    chunkCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("CHUNK_CREATED"),
    },
  },
};

export default chunkResolver;
