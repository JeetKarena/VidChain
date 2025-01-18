use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChunkMetadata {
    pub chunk_id: String,
    pub video_id: String,
    pub blob_path: String,
    pub hash: String,
    pub index: i32,
    pub size: i64,
}