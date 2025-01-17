/* fn main() {
    println!("Hello, world!");
}
 */

 use tonic::transport::Server;
 use dotenv::dotenv;
 
 mod error;
 mod video_service;
 mod proto {
     tonic::include_proto!("video_service");
 }
 
 use video_service::VideoServiceImpl;
 use proto::video_service_server::VideoServiceServer;
 
 #[tokio::main]
 async fn main() -> Result<(), Box<dyn std::error::Error>> {
     dotenv().ok();
     
     let addr = "[::1]:50051".parse()?;
     let service = VideoServiceImpl::new().await?;
     
     println!("Video service server running on {}", addr);
     
     Server::builder()
         .add_service(VideoServiceServer::new(service))
         .serve(addr)
         .await?;
 
     Ok(())
 }

/* 
fn main() -> Result<(), Box<dyn std::error::Error>> {

    tonic_build::compile_protos("proto/video_service.proto")?;

    Ok(())

} */
