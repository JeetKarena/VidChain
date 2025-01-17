import { ISharedLink, SharedLink } from "../../models/SharedLink";

const sharedLinkResolver = {
  Query: {
    getSharedLink: async (
      _: any,
      { id }: { id: string }
    ): Promise<ISharedLink | null> => {
      return await SharedLink.findById(id);
    },
    getAllSharedLinks: async (
      _: any,
      { video_id }: { video_id: string }
    ): Promise<ISharedLink[]> => {
      return await SharedLink.find({ video_id });
    },
  },
  Mutation: {
    createSharedLink: async (
      _: any,
      {
        input,
      }: {
        input: {
          link_id: string;
          video_id: string;
          expiry_date: Date;
          viewer_id?: string;
        };
      }
    ): Promise<ISharedLink> => {
      const { link_id, video_id, expiry_date, viewer_id } = input;
      const sharedLink = new SharedLink({
        link_id,
        video_id,
        expiry_date,
        viewer_id,
      });
      return await sharedLink.save();
    },
    deleteSharedLink: async (
      _: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      const result = await SharedLink.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    sharedLinkCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("SHARED_LINK_CREATED"),
    },
  },
};

export default sharedLinkResolver;
