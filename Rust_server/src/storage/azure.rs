use tonic::{Request, Response, Status};
use uuid::Uuid;
use std::sync::Arc;
use tokio::sync::Mutex;
use futures::stream::StreamExt;
use std::collections::HashMap;

use crate::proto::video_service_server::VideoService;
use crate::proto::{ChunkData, UploadResponse, DownloadRequest, NotifyCompletionRequest, NotifyCompletionResponse};
use crate::error::ServiceError;
use crate::models::{ChunkMetadata, VideoMetadata, MAX_FILE_SIZE, CHUNK_SIZE};
use crate::storage::Storage;

pub struct VideoServiceImpl<S: Storage> {
    storage: Arc<S>,
    upload_sessions: Arc<Mutex<HashMap<String, Vec<ChunkMetadata>>>>,
}

impl<S: Storage> VideoServiceImpl<S> {
    pub fn new(storage: Arc<S>) -> Self {
        Self {
            storage,
            upload_sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    async fn process_chunk(&self, chunk: ChunkData) -> Result<(), ServiceError> {
        if chunk.content.len() > CHUNK_SIZE {
            return Err(ServiceError::Validation(
                format!("Chunk size exceeds maximum of {}MB", CHUNK_SIZE / 1024 / 1024)
            ));
        }

        let chunk_metadata = ChunkMetadata {
            chunk_id: format!("{}_{}", chunk.video_id, chunk.chunk_index),
            video_id: chunk.video_id.clone(),
            blob_path: "".to_string(), // Will be set by storage
            hash: chunk.hash.clone(),
            index: chunk.chunk_index,
            size: chunk.content.len() as i64,
        };

        self.storage.store_chunk(chunk_metadata.clone(), chunk.content).await?;
        let mut sessions = self.upload_sessions.lock().await;
        sessions.entry(chunk.video_id.clone())
            .or_insert_with(Vec::new)
            .push(chunk_metadata);

        Ok(())
    }

    async fn finalize_upload(&self, video_id: &str) -> Result<VideoMetadata, ServiceError> {
        let sessions = self.upload_sessions.lock().await;
        let chunks = sessions.get(video_id)
            .ok_or_else(|| ServiceError::Validation("No upload session found".into()))?
            .clone();

        let total_size: i64 = chunks.iter().map(|c| c.size).sum();
        if total_size > MAX_FILE_SIZE as i64 {
            return Err(ServiceError::FileSizeExceeded(
                format!("Total file size exceeds maximum of {}GB", MAX_FILE_SIZE / 1024 / 1024 / 1024)
            ));
        }

        let metadata = VideoMetadata {
            video_id: video_id.to_string(),
            total_chunks: chunks.len() as i32,
            total_size,
            chunks,
            created_at: chrono::Utc::now(),
            storage_type: crate::models::video::StorageType::Azure,
        };

        Ok(metadata)
    }
}

#[tonic::async_trait]
impl<S: Storage + 'static> VideoService for VideoServiceImpl<S> {
    type UploadVideoStream = tonic::Status;
    
    async fn upload_video(
        &self,
        request: Request<tonic::Streaming<ChunkData>>,
    ) -> Result<Response<UploadResponse>, Status> {
        let mut stream = request.into_inner();
        let video_id = Uuid::new_v4().to_string();
        
        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result.map_err(|e| Status::internal(e.to_string()))?;
            self.process_chunk(chunk)
                .await
                .map_err(Status::from)?;
        }

        let metadata = self.finalize_upload(&video_id).await.map_err(Status::from)?;

        Ok(Response::new(UploadResponse {
            video_id,
            success: true,
            message: "Video uploaded successfully".to_string(),
            metadata,
        }))
    }

    type DownloadVideoStream = tokio_stream::wrappers::ReceiverStream<Result<ChunkData, Status>>;

    async fn download_video(
        &self,
        request: Request<DownloadRequest>,
    ) -> Result<Response<Self::DownloadVideoStream>, Status> {
        let video_id = request.into_inner().video_id;
        let chunks = self.storage
            .get_video_metadata(&video_id)
            .await
            .map_err(Status::from)?
            .chunks;

        let (tx, rx) = tokio::sync::mpsc::channel(32);

        tokio::spawn(async move {
            for chunk in chunks {
                let data = self.storage.retrieve_chunk(&chunk.chunk_id).await.unwrap();
                let chunk_data = ChunkData {
                    content: data,
                    video_id: chunk.video_id.clone(),
                    chunk_index: chunk.index,
                    hash: chunk.hash.clone(),
                };
                
                if tx.send(Ok(chunk_data)).await.is_err() {
                    break;
                }
            }
        });

        Ok(Response::new(tokio_stream::wrappers::ReceiverStream::new(rx)))
    }

    async fn notify_completion(
        &self,
        request: Request<NotifyCompletionRequest>,
    ) -> Result<Response<NotifyCompletionResponse>, Status> {
        let req = request.into_inner();
        if req.success {
            println!("Upload completed successfully for video_id: {}", req.video_id);
        } else {
            println!("Upload failed for video_id: {}", req.video_id);
        }

        Ok(Response::new(NotifyCompletionResponse {
            message: "Notification received".to_string(),
        }))
    }
}