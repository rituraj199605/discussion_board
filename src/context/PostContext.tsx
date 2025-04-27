// src/context/PostContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, User, MediaFile } from '../types';
import { getStorageService } from '../services/storage';

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  addPost: (text: string, author: User, media?: MediaFile[]) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  addReply: (parentId: string, text: string, author: User, media?: MediaFile[]) => Promise<void>;
  getPostById: (postId: string) => Post | undefined;
  refreshPosts: () => Promise<void>;
}

// Create context with default values
const PostContext = createContext<PostContextType>({
  posts: [],
  loading: false,
  error: null,
  addPost: async () => {},
  deletePost: async () => {},
  likePost: async () => {},
  addReply: async () => {},
  getPostById: () => undefined,
  refreshPosts: async () => {},
});

// Hook for consuming the post context
export const usePosts = () => useContext(PostContext);

interface PostProviderProps {
  children: React.ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const storageService = getStorageService();
  
  // Load posts on initial render
  useEffect(() => {
    refreshPosts();
  }, []);
  
  // Refresh posts from storage
  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPosts = await storageService.getPosts();
      setPosts(loadedPosts);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add a new post
  const addPost = useCallback(async (text: string, author: User, media?: MediaFile[]) => {
    try {
      setLoading(true);
      
      // Create new post
      const newPost: Post = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        text,
        author,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: [],
        media
      };
      
      // Add to state
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      
      // Save to storage
      await storageService.savePosts(updatedPosts);
    } catch (err) {
      setError('Failed to add post');
      console.error('Error adding post:', err);
      // Roll back
      await refreshPosts();
    } finally {
      setLoading(false);
    }
  }, [posts, refreshPosts]);
  
  // Delete a post
  const deletePost = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      
      // Delete from storage
      const updatedPosts = await storageService.deletePost(postId);
      setPosts(updatedPosts);
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
      await refreshPosts();
    } finally {
      setLoading(false);
    }
  }, [refreshPosts]);
  
  // Like a post
  const likePost = useCallback(async (postId: string, userId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map(post => {
        if (post.id === postId && !post.likedBy.includes(userId)) {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, userId]
          };
        }
        
        // Check replies
        if (post.replies && post.replies.length > 0) {
          return {
            ...post,
            replies: post.replies.map(reply => {
              if (reply.id === postId && !reply.likedBy.includes(userId)) {
                return {
                  ...reply,
                  likes: reply.likes + 1,
                  likedBy: [...reply.likedBy, userId]
                };
              }
              return reply;
            })
          };
        }
        
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Save to storage
      await storageService.savePosts(updatedPosts);
    } catch (err) {
      setError('Failed to like post');
      console.error('Error liking post:', err);
      await refreshPosts();
    }
  }, [posts, refreshPosts]);
  
  // Add a reply to a post
  const addReply = useCallback(async (parentId: string, text: string, author: User, media?: MediaFile[]) => {
    try {
      setLoading(true);
      
      // Create new reply
      const newReply: Post = {
        id: crypto.randomUUID ? crypto.randomUUID() : `reply-${Date.now()}`,
        text,
        author,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: [],
        parentId,
        media
      };
      
      // Add to parent post
      const updatedPosts = posts.map(post => {
        if (post.id === parentId) {
          return {
            ...post,
            replies: [...post.replies, newReply]
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Save to storage
      await storageService.savePosts(updatedPosts);
    } catch (err) {
      setError('Failed to add reply');
      console.error('Error adding reply:', err);
      await refreshPosts();
    } finally {
      setLoading(false);
    }
  }, [posts, refreshPosts]);
  
  // Get a post by ID
  const getPostById = useCallback((postId: string): Post | undefined => {
    // Look for the post in top-level posts
    const post = posts.find(p => p.id === postId);
    if (post) return post;
    
    // Look in replies
    for (const p of posts) {
      const reply = p.replies?.find(r => r.id === postId);
      if (reply) return reply;
    }
    
    return undefined;
  }, [posts]);
  
  const value = {
    posts,
    loading,
    error,
    addPost,
    deletePost,
    likePost,
    addReply,
    getPostById,
    refreshPosts,
  };
  
  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};