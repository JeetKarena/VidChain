import {
  ITemporarySharedLink,
  TemporarySharedLink,
} from "../../models/TemporarySharedLink";

const temporarySharedLinkResolver = {
  Query: {
    getTemporarySharedLink: async (
      _: any,
      { id }: { id: string }
    ): Promise<ITemporarySharedLink | null> => {
      return await TemporarySharedLink.findById(id);
    },
    getAllTemporarySharedLinks: async (
      _: any,
      { video_id }: { video_id: string }
    ): Promise<ITemporarySharedLink[]> => {
      return await TemporarySharedLink.find({ video_id });
    },
  },
  Mutation: {
    createTemporarySharedLink: async (
      _: any,
      {
        input,
      }: {
        input: {
          link_id: string;
          video_id: string;
          viewer_id?: string;
          expires_at: Date;
        };
      }
    ): Promise<ITemporarySharedLink> => {
      const { link_id, video_id, viewer_id, expires_at } = input;
      const temporarySharedLink = new TemporarySharedLink({
        link_id,
        video_id,
        viewer_id,
        expires_at,
      });
      return await temporarySharedLink.save();
    },
    deleteTemporarySharedLink: async (
      _: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      const result = await TemporarySharedLink.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    temporarySharedLinkCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("TEMPORARY_SHARED_LINK_CREATED"),
    },
  },
};

export default temporarySharedLinkResolver;
