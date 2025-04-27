// src/types/index.ts

export interface User {
    id: string;
    name: string;
  }
  
  export interface MediaFile {
    id: string;
    type: 'image' | 'video';
    url: string;
    name: string;
    size?: number;
    contentHash?: string; // For security/integrity validation
  }
  
  export interface Post {
    id: string;
    text: string;
    author: User;
    timestamp: string;
    likes: number;
    likedBy: string[]; // List of user IDs who liked the post
    replies: Post[];
    parentId?: string;
    media?: MediaFile[];
    isDeleted?: boolean;
    lastEdited?: string;
  }
  
  export type PostSortOptions = 'newest' | 'oldest' | 'mostLiked' | 'mostReplies';
  
  export type StorageMethod = 'electron' | 'localStorage';
  
  export interface StorageOptions {
    encrypt?: boolean;
    compress?: boolean;
  }
  
  export interface StorageServiceInterface {
    getPosts(): Promise<Post[]>;
    savePosts(posts: Post[]): Promise<boolean>;
    deletePost(postId: string): Promise<Post[]>;
    likePost(postId: string, userId: string): Promise<void>;
    addReply(parentId: string, reply: Post): Promise<void>;
  }
  
  export enum SecurityLevel {
    STANDARD = 'standard',
    HIGH = 'high',
    MAXIMUM = 'maximum'
  }