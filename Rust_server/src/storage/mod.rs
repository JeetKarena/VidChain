use async_trait::async_trait;
use crate::error::ServiceError;
use crate::models::{ChunkMetadata, VideoMetadata};

#[async_trait]
pub trait Storage {
    async fn store_chunk(&self, chunk: ChunkMetadata, data: Vec<u8>) -> Result<(), ServiceError>;
    async fn retrieve_chunk(&self, chunk_id: &str) -> Result<Vec<u8>, ServiceError>;
    async fn delete_video(&self, video_id: &str) -> Result<(), ServiceError>;
    async fn get_video_metadata(&self, video_id: &str) -> Result<VideoMetadata, ServiceError>;
}

pub mod azure;
pub mod local;