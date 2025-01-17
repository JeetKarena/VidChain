import userResolver from "./userResolver";
import videoResolver from "./videoResolver";
import chunkResolver from "./chunkResolver";
import sharedLinkResolver from "./sharedLinkResolver";
import sessionResolver from "./sessionResolver";
import temporarySharedLinkResolver from "./temporarySharedLinkResolver";

const resolvers = {
  Query: {
    ...userResolver.Query,
    ...videoResolver.Query,
    ...chunkResolver.Query,
    ...sharedLinkResolver.Query,
    ...sessionResolver.Query,
    ...temporarySharedLinkResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...videoResolver.Mutation,
    ...chunkResolver.Mutation,
    ...sharedLinkResolver.Mutation,
    ...sessionResolver.Mutation,
    ...temporarySharedLinkResolver.Mutation,
  },
  Subscription: {
    ...userResolver.Subscription,
    ...videoResolver.Subscription,
    ...chunkResolver.Subscription,
    ...sharedLinkResolver.Subscription,
    ...sessionResolver.Subscription,
    ...temporarySharedLinkResolver.Subscription,
  },
};

export default resolvers;
