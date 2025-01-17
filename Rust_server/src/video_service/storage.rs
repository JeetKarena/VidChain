use azure_storage_blobs::prelude::*;
use futures::stream::StreamExt;
use crate::error::VideoServiceError;
use std::sync::Arc;

const CHUNK_SIZE: usize = 25 * 1024 * 1024; // 25MB in bytes
const MAX_UPLOAD_SIZE: usize = 5 * 1024 * 1024 * 1024; // 5GB max file size

pub struct AzureStorage {
    client: Arc<BlobServiceClient>,
    container_name: String,
}

impl AzureStorage {
    pub fn new(account: String, key: String, container: String) -> Self {
        let client = BlobServiceClient::new_account_key(account, key);
        Self {
            client: Arc::new(client),
            container_name: container,
        }
    }

    pub async fn upload_chunk(
        &self, 
        video_id: &str, 
        chunk_index: i32, 
        data: Vec<u8>
    ) -> Result<(), VideoServiceError> {
        if data.len() > CHUNK_SIZE {
            return Err(VideoServiceError::ValidationError(
                format!("Chunk size exceeds maximum of {}MB", CHUNK_SIZE / 1024 / 1024)
            ));
        }

        let blob_name = format!("{}/chunk_{:05}", video_id, chunk_index);
        
        self.client
            .as_container_client(&self.container_name)
            .as_blob_client(&blob_name)
            .put_block_blob(data)
            .await
            .map_err(|e| VideoServiceError::StorageError(e.to_string()))?;

        Ok(())
    }

    pub async fn download_chunks(
        &self, 
        video_id: &str
    ) -> Result<Vec<Vec<u8>>, VideoServiceError> {
        let container_client = self.client.as_container_client(&self.container_name);
        let prefix = format!("{}/", video_id);
        
        let mut blobs = container_client
            .list_blobs()
            .prefix(&prefix)
            .into_stream();
        
        let mut chunks = Vec::new();
        let mut total_size = 0;
        
        while let Some(blob_result) = blobs.next().await {
            let blob = blob_result.map_err(|e| VideoServiceError::StorageError(e.to_string()))?;
            let blob_client = container_client.as_blob_client(blob.name);
            
            let content = blob_client
                .get_blob()
                .await
                .map_err(|e| VideoServiceError::StorageError(e.to_string()))?
                .data;

            total_size += content.len();
            if total_size > MAX_UPLOAD_SIZE {
                return Err(VideoServiceError::ValidationError(
                    format!("Total video size exceeds maximum of {}GB", MAX_UPLOAD_SIZE / 1024 / 1024 / 1024)
                ));
            }

            chunks.push(content);
        }
        
        Ok(chunks)
    }

    pub async fn delete_video(&self, video_id: &str) -> Result<(), VideoServiceError> {
        let container_client = self.client.as_container_client(&self.container_name);
        let prefix = format!("{}/", video_id);
        
        let mut blobs = container_client
            .list_blobs()
            .prefix(&prefix)
            .into_stream();
        
        while let Some(blob_result) = blobs.next().await {
            let blob = blob_result.map_err(|e| VideoServiceError::StorageError(e.to_string()))?;
            let blob_client = container_client.as_blob_client(blob.name);
            
            blob_client
                .delete()
                .await
                .map_err(|e| VideoServiceError::StorageError(e.to_string()))?;
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    #[tokio::test]
    async fn test_chunk_size_validation() {
        let storage = AzureStorage::new(
            "test".to_string(),
            "key".to_string(),
            "container".to_string()
        );
        
        let large_chunk = vec![0; CHUNK_SIZE + 1];
        let result = storage.upload_chunk("test-video", 0, large_chunk).await;
        
        assert!(matches!(result, Err(VideoServiceError::ValidationError(_))));
    }
}