import { IVideo, Video } from '../../models/Video';
import { ServiceError, ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

interface AddVideoRequest {
    title: string;
    uploaderId: string;
    storageUrl: string;
}

interface VideoResponse {
    id: string;
}

const videoService = {
    AddVideo: async (call: ServerUnaryCall<AddVideoRequest, VideoResponse>, callback: sendUnaryData<VideoResponse>): Promise<void> => {
        const { title, uploaderId, storageUrl } = call.request;
        const video = new Video({ title, uploaderId, storageUrl });
        await video.save();
        callback(null, { id: video.id });
    },
    GetVideo: async (call: ServerUnaryCall<{ id: string }, IVideo>, callback: sendUnaryData<IVideo>): Promise<void> => {
        const video = await Video.findById(call.request.id).populate('uploaderId');
        if (!video) return callback(new Error('Video not found') as ServiceError);
        callback(null, video);
    },
};

export default videoService;