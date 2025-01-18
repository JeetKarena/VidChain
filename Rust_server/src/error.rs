use thiserror::Error;
use tonic::Status;

#[derive(Error, Debug)]
pub enum ServiceError {
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("File size exceeds limit: {0}")]
    FileSizeExceeded(String),
    
    #[error("IO error: {0}")]
    IO(#[from] std::io::Error),
}

impl From<ServiceError> for Status {
    fn from(err: ServiceError) -> Self {
        match err {
            ServiceError::Validation(msg) => Status::invalid_argument(msg),
            ServiceError::FileSizeExceeded(msg) => Status::resource_exhausted(msg),
            _ => Status::internal(err.to_string()),
        }
    }
}