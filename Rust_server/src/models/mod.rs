pub mod chunk;
pub mod video;

pub use chunk::ChunkMetadata;
pub use video::{Video, VideoMetadata, VideoVisibility};

pub const MAX_FILE_SIZE: usize = 5 * 1024 * 1024 * 1024; // 5GB
pub const CHUNK_SIZE: usize = 25 * 1024 * 1024; // 25MB