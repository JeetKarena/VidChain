use std::sync::Arc;
use dotenv::dotenv;
use tonic::transport::Server;

mod error;
mod models;
mod service;
mod storage;

use service::video_service::VideoServiceImpl;
use storage::local::LocalStorage;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    
    let storage = Arc::new(LocalStorage::new("./data/chunks"));
    let video_service = VideoServiceImpl::new(storage);
    
    let addr = "[::1]:50051".parse()?;
    println!("VideoService server listening on {}", addr);
    
    Server::builder()
        .add_service(proto::video_service_server::VideoServiceServer::new(video_service))
        .serve(addr)
        .await?;
    
    Ok(())
}