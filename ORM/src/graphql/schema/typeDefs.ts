import { gql } from "apollo-server";

export const typeDefs = gql`
  # Types
  type User {
    id: ID!
    username: String!
    email: String!
    passwordHash: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Video {
    id: ID!
    video_id: String!
    title: String!
    description: String
    owner_id: String!
    visibility: String!
    created_at: String!
    updated_at: String!
    chunks: [Chunk!]!
    shared_links: [SharedLink!]!
  }

  type Chunk {
    id: ID!
    chunk_id: String!
    video_id: String!
    blob_path: String!
    hash: String!
  }

  type SharedLink {
    id: ID!
    link_id: String!
    video_id: String!
    expiry_date: String!
    viewer_id: String
  }

  type Session {
    id: ID!
    session_id: ID!
    user_id: ID!
    token: String!
    expires_at: String!
    created_at: String!
  }

  type TemporarySharedLink {
    id: ID!
    link_id: ID!
    video_id: ID!
    viewer_id: ID
    expires_at: String!
  }

  # Inputs
  input CreateUserInput {
    username: String!
    email: String!
    passwordHash: String!
    role: String
  }

  input UpdateUserInput {
    username: String
    email: String
    role: String
  }

  input CreateVideoInput {
    video_id: String!
    title: String!
    description: String
    owner_id: String!
    visibility: String!
  }

  input UpdateVideoInput {
    title: String
    description: String
    visibility: String
  }

  input CreateChunkInput {
    chunk_id: String!
    video_id: String!
    blob_path: String!
    hash: String!
  }

  input CreateSharedLinkInput {
    link_id: String!
    video_id: String!
    expiry_date: String!
    viewer_id: String
  }

  input CreateSessionInput {
    user_id: ID!
    token: String!
    expires_at: String!
  }

  input CreateTemporarySharedLinkInput {
    link_id: ID!
    video_id: ID!
    viewer_id: ID
    expires_at: String!
  }

  # Queries
  type Query {
    # User Queries
    getUser(id: ID!): User
    getAllUsers: [User!]!

    # Video Queries
    getVideo(id: ID!): Video
    getAllVideos: [Video!]!

    # Chunk Queries
    getChunk(id: ID!): Chunk
    getAllChunks(video_id: String!): [Chunk!]!

    # SharedLink Queries
    getSharedLink(id: ID!): SharedLink
    getAllSharedLinks(video_id: String!): [SharedLink!]!

    # Session Queries
    getSession(id: ID!): Session
    getAllSessions: [Session!]!

    # TemporarySharedLink Queries
    getTemporarySharedLink(id: ID!): TemporarySharedLink
    getAllTemporarySharedLinks(video_id: ID!): [TemporarySharedLink!]!
  }

  # Mutations
  type Mutation {
    # User Mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Video Mutations
    createVideo(input: CreateVideoInput!): Video!
    updateVideo(id: ID!, input: UpdateVideoInput!): Video!
    deleteVideo(id: ID!): Boolean!

    # Chunk Mutations
    createChunk(input: CreateChunkInput!): Chunk!
    deleteChunk(id: ID!): Boolean!

    # SharedLink Mutations
    createSharedLink(input: CreateSharedLinkInput!): SharedLink!
    deleteSharedLink(id: ID!): Boolean!

    # Session Mutations
    createSession(input: CreateSessionInput!): Session!
    deleteSession(id: ID!): Boolean!

    # TemporarySharedLink Mutations
    createTemporarySharedLink(
      input: CreateTemporarySharedLinkInput!
    ): TemporarySharedLink!
    deleteTemporarySharedLink(id: ID!): Boolean!
  }

  # Subscriptions
  type Subscription {
    userCreated: User!
    videoCreated: Video!
    chunkCreated: Chunk!
    sharedLinkCreated: SharedLink!
    sessionCreated: Session!
    temporarySharedLinkCreated: TemporarySharedLink!
  }
`;

export default typeDefs;
