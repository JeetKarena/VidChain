import { IUser, User } from '../../models/User';
import { ServiceError, ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

interface AddUserRequest {
    username: string;
    email: string;
    passwordHash: string;
    role: string;
}

interface GetUserRequest {
    id: string;
}

interface UserResponse {
    id: string;
    username: string;
    email: string;
    role: string;
}

const userService = {
    AddUser: async (call: ServerUnaryCall<AddUserRequest, UserResponse>, callback: sendUnaryData<UserResponse>): Promise<void> => {
        const { username, email, passwordHash, role } = call.request;
        const user = new User({ username, email, passwordHash, role });
        await user.save();
        callback(null, { id: user.id, username: user.username, email: user.email, role: user.role });
    },
    GetUser: async (call: ServerUnaryCall<GetUserRequest, UserResponse>, callback: sendUnaryData<UserResponse>): Promise<void> => {
        const user = await User.findById(call.request.id);
        if (!user) return callback(new Error('User not found') as ServiceError);
        callback(null, { id: user.id, username: user.username, email: user.email, role: user.role });
    },
};

export default userService;