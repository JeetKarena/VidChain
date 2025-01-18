use super::ChunkMetadata;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum VideoVisibility {
    Public,
    Private,
    Shared,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Video {
    pub id: String,
    pub title: String,
    pub description: String,
    pub owner_id: String,
    pub visibility: VideoVisibility,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub video_id: String,
    pub total_chunks: i32,
    pub total_size: i64,
    pub chunks: Vec<ChunkMetadata>,
    pub created_at: DateTime<Utc>,
    pub storage_type: StorageType,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum StorageType {
    Azure,
    Local,
}