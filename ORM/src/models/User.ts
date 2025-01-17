import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', userSchema);