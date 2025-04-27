// src/hooks/usePosts.ts
import { useState, useEffect, useCallback } from 'react';
import { Post, User, MediaFile, PostSortOptions } from '../types';
import { getStorageService } from '../services/storage';
import { detectDangerousContent, sanitizeText } from '../utils/security';
import { generateSecureId } from '../utils/security';

interface UsePostsOptions {
  autoLoad?: boolean;
  sortOrder?: PostSortOptions;
  filter?: string;
}

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
  addPost: (text: string, author: User, media?: MediaFile[]) => Promise<Post>;
  updatePost: (postId: string, text: string, media?: MediaFile[]) => Promise<Post | null>;
  deletePost: (postId: string) => Promise<boolean>;
  likePost: (postId: string, userId: string) => Promise<boolean>;
  addReply: (parentId: string, text: string, author: User, media?: MediaFile[]) => Promise<Post | null>;
  getPostById: (postId: string) => Post | undefined;
  refreshPosts: () => Promise<void>;
  sortPosts: (option: PostSortOptions) => void;
  filterPosts: (term: string) => void;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const { 
    autoLoad = true, 
    sortOrder = 'newest', 
    filter = '' 
  } = options;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<PostSortOptions>(sortOrder);
  const [filterTerm, setFilterTerm] = useState<string>(filter);
  
  const storageService = getStorageService();
  
  // Load posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedPosts = await storageService.getPosts();
      setPosts(loadedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sort and filter posts
  useEffect(() => {
    // First apply the sorting
    let sortedPosts = [...posts];
    
    switch (currentSort) {
      case 'newest':
        sortedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        sortedPosts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'mostLiked':
        sortedPosts.sort((a, b) => b.likes - a.likes);
        break;
      case 'mostReplies':
        sortedPosts.sort((a, b) => b.replies.length - a.replies.length);
        break;
    }
    
    // Then apply the filter if any
    if (filterTerm) {
      const lowercaseTerm = filterTerm.toLowerCase();
      sortedPosts = sortedPosts.filter(post => {
        // Search in post content
        if (post.text.toLowerCase().includes(lowercaseTerm)) return true;
        
        // Search in author name
        if (post.author.name.toLowerCase().includes(lowercaseTerm)) return true;
        
        // Search in replies
        if (post.replies.some(reply => {
          return (
            reply.text.toLowerCase().includes(lowercaseTerm) ||
            reply.author.name.toLowerCase().includes(lowercaseTerm)
          );
        })) return true;
        
        return false;
      });
    }
    
    setFilteredPosts(sortedPosts);
  }, [posts, currentSort, filterTerm]);
  
  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadPosts();
    }
  }, [autoLoad, loadPosts]);
  
  // Add a new post
  const addPost = useCallback(async (
    text: string, 
    author: User, 
    media: MediaFile[] = []
  ): Promise<Post> => {
    // Security checks
    if (detectDangerousContent(text)) {
      throw new Error('Post contains potentially unsafe content');
    }
    
    // Create the post
    const newPost: Post = {
      id: generateSecureId(),
      text: sanitizeText(text), // Sanitize the text
      author: {
        id: author.id,
        name: sanitizeText(author.name) // Sanitize the author name
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
      media
    };
    
    try {
      setLoading(true);
      
      // Add to posts
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      
      // Save to storage
      await storageService.savePosts(updatedPosts);
      
      return newPost;
    } catch (err) {
      console.error('Error adding post:', err);
      throw new Error('Failed to add post');
    } finally {
      setLoading(false);
    }
  }, [posts]);
  
  // Update a post
  const updatePost = useCallback(async (
    postId: string, 
    text: string, 
    media?: MediaFile[]
  ): Promise<Post | null> => {
    // Security checks
    if (detectDangerousContent(text)) {
      throw new Error('Post contains potentially unsafe content');
    }
    
    try {
      setLoading(true);
      
      // Find the post
      const postToUpdate = getPostById(postId);
      if (!postToUpdate) {
        throw new Error('Post not found');
      }
      
      // Update the post
      const updatedPost: Post = {
        ...postToUpdate,
        text: sanitizeText(text),
        lastEdited: new Date().toISOString(),
        media: media || postToUpdate.media
      };
      
      // Update in the list
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return updatedPost;
        }
        
        // Check for the post in replies
        if (post.replies.some(reply => reply.id === postId)) {
          return {
            ...post,
            replies: post.replies.map(reply => 
              reply.id === postId ? updatedPost : reply
            )
          };
        }
        
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Save to storage
      await storageService.savePosts(updatedPosts);
      
      return updatedPost;
    } catch (err) {
      console.error('Error updating post:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [posts]);
  
  // Delete a post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Delete from storage
      const updatedPosts = await storageService.deletePost(postId);
      setPosts(updatedPosts);
      
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Like a post
  const likePost = useCallback(async (
    postId: string, 
    userId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find the post
      const postToLike = getPostById(postId);
      if (!postToLike) {
        throw new Error('Post not found');
      }
      
      // Check if user already liked
      if (postToLike.likedBy.includes(userId)) {
        return true; // Already liked
      }
      
      // Update post likes
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, userId]
          };
        }
        
        // Check replies
        if (post.replies.some(reply => reply.id === postId)) {
          return {
            ...post,
            replies: post.replies.map(reply => {
              if (reply.id === postId) {
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
      
      return true;
    } catch (err) {
      console.error('Error liking post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [posts]);
  
  // Add a reply to a post
  const addReply = useCallback(async (
    parentId: string, 
    text: string, 
    author: User, 
    media: MediaFile[] = []
  ): Promise<Post | null> => {
    // Security checks
    if (detectDangerousContent(text)) {
      throw new Error('Reply contains potentially unsafe content');
    }
    
    try {
      setLoading(true);
      
      // Find the parent post
      const parentPost = posts.find(post => post.id === parentId);
      if (!parentPost) {
        throw new Error('Parent post not found');
      }
      
      // Create the reply
      const newReply: Post = {
        id: generateSecureId(),
        text: sanitizeText(text),
        author: {
          id: author.id,
          name: sanitizeText(author.name)
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: [],
        parentId,
        media
      };
      
      // Add reply to parent
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
      
      return newReply;
    } catch (err) {
      console.error('Error adding reply:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [posts]);
  
  // Get a post by ID (including replies)
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
  
  // Refresh posts
  const refreshPosts = useCallback(async (): Promise<void> => {
    await loadPosts();
  }, [loadPosts]);
  
  // Sort posts
  const sortPosts = useCallback((option: PostSortOptions): void => {
    setCurrentSort(option);
  }, []);
  
  // Filter posts
  const filterPosts = useCallback((term: string): void => {
    setFilterTerm(term);
  }, []);
  
  return {
    posts: filteredPosts, // Return the sorted and filtered posts
    loading,
    error,
    addPost,
    updatePost,
    deletePost,
    likePost,
    addReply,
    getPostById,
    refreshPosts,
    sortPosts,
    filterPosts
  };
}