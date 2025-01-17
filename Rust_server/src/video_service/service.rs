use tonic::{Request, Response, Status};
use uuid::Uuid;
use std::sync::Arc;
use tokio::sync::Mutex;
use futures::stream::StreamExt;
use std::collections::HashMap;

use crate::proto::video_service_server::VideoService;
use crate::proto::{ChunkData, UploadResponse, DownloadRequest};
use crate::error::VideoServiceError;
use super::storage::{AzureStorage, CHUNK_SIZE};

#[derive(Debug)]
struct UploadSession {
    chunks_received: i32,
    total_size: usize,
}

pub struct VideoServiceImpl {
    storage: Arc<AzureStorage>,
    upload_sessions: Arc<Mutex<HashMap<String, UploadSession>>>,
}

impl VideoServiceImpl {
    pub async fn new() -> Result<Self, VideoServiceError> {
        let account = std::env::var("AZURE_STORAGE_ACCOUNT")
            .map_err(|_| VideoServiceError::ValidationError("AZURE_STORAGE_ACCOUNT not set".to_string()))?;
        let key = std::env::var("AZURE_STORAGE_KEY")
            .map_err(|_| VideoServiceError::ValidationError("AZURE_STORAGE_KEY not set".to_string()))?;
        let container = std::env::var("AZURE_CONTAINER_NAME")
            .unwrap_or_else(|_| "video-chunks".to_string());

        Ok(Self {
            storage: Arc::new(AzureStorage::new(account, key, container)),
            upload_sessions: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    async fn process_chunk(&self, chunk: ChunkData) -> Result<(), VideoServiceError> {
        let mut sessions = self.upload_sessions.lock().await;
        let session = sessions
            .entry(chunk.video_id.clone())
            .or_insert(UploadSession {
                chunks_received: 0,
                total_size: 0,
            });

        session.chunks_received += 1;
        session.total_size += chunk.content.len();

        self.storage.upload_chunk(&chunk.video_id, chunk.chunk_index, chunk.content).await
    }
}

#[tonic::async_trait]
impl VideoService for VideoServiceImpl {
    type UploadVideoStream = tonic::Status;
    
    async fn upload_video(
        &self,
        request: Request<tonic::Streaming<ChunkData>>,
    ) -> Result<Response<UploadResponse>, Status> {
        let mut stream = request.into_inner();
        let video_id = Uuid::new_v4().to_string();
        
        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result.map_err(|e| Status::internal(e.to_string()))?;
            if let Err(e) = self.process_chunk(chunk).await {
                // Cleanup on error
                if let Err(cleanup_err) = self.storage.delete_video(&video_id).await {
                    eprintln!("Failed to cleanup after error: {}", cleanup_err);
                }
                return Err(Status::internal(e.to_string()));
            }
        }

        Ok(Response::new(UploadResponse {
            video_id: video_id,
            success: true,
            message: "Video uploaded successfully".to_string(),
        }))
    }

    type DownloadVideoStream = tokio_stream::wrappers::ReceiverStream<Result<ChunkData, Status>>;

    async fn download_video(
        &self,
        request: Request<DownloadRequest>
    ) -> Result<Response<Self::DownloadVideoStream>, Status> {
        let video_id = request.into_inner().video_id;
        let video_data = self.storage.download_chunks(&video_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let (tx, rx) = tokio::sync::mpsc::channel(32);

        tokio::spawn(async move {
            for (i, chunk) in video_data.chunks(CHUNK_SIZE).enumerate() {
                let chunk_data = ChunkData {
                    content: chunk.to_vec(),
                    video_id: video_id.clone(),
                    chunk_index: i as i32,
                };
                
                if tx.send(Ok(chunk_data)).await.is_err() {
                    break;
                }
            }
        });

        Ok(Response::new(tokio_stream::wrappers::ReceiverStream::new(rx)))
    }
}