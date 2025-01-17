use std::fmt;
use tonic::Status;

#[derive(Debug)]
pub enum VideoServiceError {
    StorageError(String),
    ValidationError(String),
    ChunkProcessingError(String),
    EnvironmentError(String),
}

impl fmt::Display for VideoServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::StorageError(msg) => write!(f, "Storage error: {}", msg),
            Self::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            Self::ChunkProcessingError(msg) => write!(f, "Chunk processing error: {}", msg),
            Self::EnvironmentError(msg) => write!(f, "Environment error: {}", msg),
        }
    }
}

impl std::error::Error for VideoServiceError {}

impl From<VideoServiceError> for Status {
    fn from(error: VideoServiceError) -> Self {
        match error {
            VideoServiceError::ValidationError(msg) => Status::invalid_argument(msg),
            VideoServiceError::StorageError(msg) => Status::internal(msg),
            VideoServiceError::ChunkProcessingError(msg) => Status::internal(msg),
            VideoServiceError::EnvironmentError(msg) => Status::failed_precondition(msg),
        }
    }
}