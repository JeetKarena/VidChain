import { IUser, User } from "../../models/User";

const userResolver = {
  Query: {
    getUser: async (_: any, { id }: { id: string }): Promise<IUser | null> => {
      try {
        return await User.findById(id);
      } catch (error) {
        console.error(`Error fetching user with id ${id}:`, error);
        throw new Error("Error fetching user");
      }
    },
    getAllUsers: async (): Promise<IUser[]> => {
      try {
        return await User.find();
      } catch (error) {
        console.error("Error fetching all users:", error);
        throw new Error("Error fetching users");
      }
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
      try {
        const { username, email, passwordHash, role } = input;
        const user = new User({ username, email, passwordHash, role });
        return await user.save();
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("User creation failed");
      }
    },
    updateUser: async (
      _: any,
      { id, input }: { id: string; input: Partial<IUser> }
    ): Promise<IUser | null> => {
      try {
        const { passwordHash, ...updateData } = input;
        return await User.findByIdAndUpdate(id, updateData, { new: true });
      } catch (error) {
        console.error(`Error updating user with id ${id}:`, error);
        throw new Error("User update failed");
      }
    },
    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const result = await User.findByIdAndDelete(id);
        return result !== null;
      } catch (error) {
        console.error(`Error deleting user with id ${id}:`, error);
        throw new Error("User deletion failed");
      }
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
