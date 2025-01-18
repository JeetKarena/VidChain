use async_trait::async_trait;
use std::path::PathBuf;
use tokio::fs;
use super::Storage;
use crate::error::ServiceError;
use crate::models::{ChunkMetadata, VideoMetadata};

pub struct LocalStorage {
    base_path: PathBuf,
}

impl LocalStorage {
    pub fn new(base_path: &str) -> Self {
        Self {
            base_path: PathBuf::from(base_path),
        }
    }
}

#[async_trait]
impl Storage for LocalStorage {
    async fn store_chunk(&self, chunk: ChunkMetadata, data: Vec<u8>) -> Result<(), ServiceError> {
        let video_path = self.base_path.join(&chunk.video_id);
        fs::create_dir_all(&video_path).await?;
        
        let chunk_path = video_path.join(format!("chunk_{:05}.bin", chunk.index));
        fs::write(chunk_path, data).await?;
        Ok(())
    }

    async fn retrieve_chunk(&self, chunk_id: &str) -> Result<Vec<u8>, ServiceError> {
        let parts: Vec<&str> = chunk_id.split('_').collect();
        if parts.len() != 2 {
            return Err(ServiceError::Validation("Invalid chunk ID format".into()));
        }

        let video_id = parts[0];
        let chunk_path = self.base_path
            .join(video_id)
            .join(format!("chunk_{}.bin", parts[1]));
            
        Ok(fs::read(chunk_path).await?)
    }

    async fn delete_video(&self, video_id: &str) -> Result<(), ServiceError> {
        let video_path = self.base_path.join(video_id);
        fs::remove_dir_all(video_path).await?;
        Ok(())
    }

    async fn get_video_metadata(&self, video_id: &str) -> Result<VideoMetadata, ServiceError> {
        let video_path = self.base_path.join(video_id);
        let mut chunks = Vec::new();
        let mut total_size = 0i64;

        let mut entries = fs::read_dir(video_path).await?;
        while let Some(entry) = entries.next_entry().await? {
            let metadata = entry.metadata().await?;
            if metadata.is_file() {
                let filename = entry.file_name().to_string_lossy().to_string();
                if filename.starts_with("chunk_") {
                    let index = filename
                        .trim_start_matches("chunk_")
                        .trim_end_matches(".bin")
                        .parse::<i32>()
                        .map_err(|_| ServiceError::Validation("Invalid chunk filename".into()))?;

                    chunks.push(ChunkMetadata {
                        chunk_id: format!("{}_{}", video_id, index),
                        video_id: video_id.to_string(),
                        blob_path: entry.path().to_string_lossy().to_string(),
                        hash: "".to_string(), // TODO: Implement hash calculation
                        index,
                        size: metadata.len() as i64,
                    });
                    total_size += metadata.len() as i64;
                }
            }
        }

        Ok(VideoMetadata {
            video_id: video_id.to_string(),
            total_chunks: chunks.len() as i32,
            total_size,
            chunks,
            created_at: chrono::Utc::now(),
            storage_type: crate::models::video::StorageType::Local,
        })
    }
}