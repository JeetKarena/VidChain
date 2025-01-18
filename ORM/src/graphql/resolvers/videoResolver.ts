import { IVideo, Video } from "../../models/Video";
import { User } from "../../models/User";
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const videoResolver = {
  Query: {
    getVideo: async (
      _: any,
      { id }: { id: string }
    ): Promise<IVideo | null> => {
      try {
        return await Video.findById(id)
          .populate("chunks")
          .populate("shared_links")
          .populate("owner"); // Populate the owner field
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    getAllVideos: async (): Promise<IVideo[]> => {
      try {
        return await Video.find()
          .populate("chunks")
          .populate("shared_links")
          .populate("owner"); // Populate the owner field
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  },
  Mutation: {
    createVideo: async (
      _: any,
      {
        input,
      }: {
        input: {
          title: string;
          description?: string;
          owner: string;
          visibility: string;
        };
      }
    ): Promise<IVideo> => {
      try {
        const { title, description, owner, visibility } = input;
        const video = new Video({ title, description, owner, visibility });
        await video.save();
        // Emit event after video creation
        pubsub.publish("VIDEO_CREATED", { videoCreated: video });
        return video;
      } catch (error) {
        console.error(error);
        throw new Error("Video creation failed.");
      }
    },
    updateVideo: async (
      _: any,
      { id, input }: { id: string; input: Partial<IVideo> }
    ): Promise<IVideo | null> => {
      try {
        return await Video.findByIdAndUpdate(id, input, { new: true });
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    deleteVideo: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const result = await Video.findByIdAndDelete(id);
        return result !== null;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  Subscription: {
    videoCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("VIDEO_CREATED"),
    },
  },
  Video: {
    owner: async (video: IVideo) => {
      return await User.findById(video.owner);
    },
  },
};

export default videoResolver;
