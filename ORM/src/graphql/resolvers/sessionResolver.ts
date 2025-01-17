import { ISession, Session } from "../../models/Session";

const sessionResolver = {
  Query: {
    getSession: async (
      _: any,
      { id }: { id: string }
    ): Promise<ISession | null> => {
      return await Session.findById(id);
    },
    getAllSessions: async (): Promise<ISession[]> => {
      return await Session.find();
    },
  },
  Mutation: {
    createSession: async (
      _: any,
      {
        input,
      }: {
        input: {
          session_id: string;
          user_id: string;
          token: string;
          expires_at: Date;
        };
      }
    ): Promise<ISession> => {
      const { session_id, user_id, token, expires_at } = input;
      const session = new Session({ session_id, user_id, token, expires_at });
      return await session.save();
    },
    deleteSession: async (_: any, { id }: { id: string }): Promise<boolean> => {
      const result = await Session.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    sessionCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("SESSION_CREATED"),
    },
  },
};

export default sessionResolver;
