import { IUser, User } from "../../models/User";

const userResolver = {
  Query: {
    getUser: async (_: any, { id }: { id: string }): Promise<IUser | null> => {
      return await User.findById(id);
    },
    getAllUsers: async (): Promise<IUser[]> => {
      return await User.find();
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      {
        input,
      }: {
        input: {
          username: string;
          email: string;
          passwordHash: string;
          role: string;
        };
      }
    ): Promise<IUser> => {
      const { username, email, passwordHash, role } = input;
      const user = new User({ username, email, passwordHash, role });
      return await user.save();
    },
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: Partial<IUser> }
    ): Promise<IUser | null> => {
      const { passwordHash, ...updateData } = input;
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    },
    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      const result = await User.findByIdAndDelete(id);
      return result !== null;
    },
  },
  Subscription: {
    userCreated: {
      subscribe: (_: any, __: any, { pubsub }: { pubsub: any }) =>
        pubsub.asyncIterator("USER_CREATED"),
    },
  },
};

export default userResolver;
