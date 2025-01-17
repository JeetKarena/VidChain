import { IVideo, Video } from "../../models/Video";

const videoResolver = {
  Query: {
    getVideo: async (
      _: any,
      { id }: { id: string }
    ): Promise<IVideo | null> => {
      return await Video.findById(id)
        .populate("chunks")
        .populate("shared_links");
    },
    getAllVideos: async (): Promise<IVideo[]> => {
      return await Video.find().populate("chunks").populate("shared_links");
    },
  },
  Mutation: {
    createVideo: async (
      _: any,
      {
        input,
      }: {
        input: {
          video_id: string;
          title: string;
          description?: string;
          owner_id: string;
          visibility: string;
        };
      }
    ): Promise<IVideo> => {
      const { video_id, title, description, owner_id, visibility } = input;
      const video = new Video({
        video_id,
        title,
        description,
        owner_id,
        visibility,
      });
      return await video.save();
    },
    updateVideo: async (
      _: any,
      { id, input }: { id: string; input: Partial<IVideo> }
    ): Promise<IVideo | null> => {
      return await Video.findByIdAndUpdate(id, input, { new: true });
    },
    deleteVideo: async (_: any, { id }: { id: string }): Promise<boolean> => {
      const result = await Video.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    videoCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("VIDEO_CREATED"),
    },
  },
};

export default videoResolver;
