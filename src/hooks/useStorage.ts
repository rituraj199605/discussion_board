// src/hooks/useStorage.ts
import { useState, useCallback } from 'react';
import { Post, StorageServiceInterface, StorageMethod, StorageOptions } from '../types';
import { getStorageService } from '../services/storage';

interface UseStorageResult {
  saveData: <T>(key: string, data: T) => Promise<boolean>;
  loadData: <T>(key: string, defaultValue?: T) => Promise<T>;
  removeData: (key: string) => Promise<boolean>;
  savePosts: (posts: Post[]) => Promise<boolean>;
  loadPosts: () => Promise<Post[]>;
  deletePost: (postId: string) => Promise<Post[]>;
  error: string | null;
  loading: boolean;
  clearError: () => void;
}

/**
 * Hook for abstracting storage operations
 * Works with both Electron and web storage
 */
export function useStorage(
  method?: StorageMethod,
  options: StorageOptions = {}
): UseStorageResult {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get the appropriate storage service
  const storageService = getStorageService(method);
  
  /**
   * Save generic data by key
   */
  const saveData = useCallback(async <T>(key: string, data: T): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For web storage
      if (method === 'localStorage' || (!method && !window.electron)) {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      }
      
      // For custom storage service
      if (key === 'posts' && Array.isArray(data)) {
        return await storageService.savePosts(data as unknown as Post[]);
      }
      
      // If this is electron but not a known key, fall back to localStorage
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error(`Error saving data for key "${key}":`, err);
      setError(`Failed to save data: ${(err as Error).message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [method, storageService]);
  
  /**
   * Load generic data by key
   */
  const loadData = useCallback(async <T>(key: string, defaultValue?: T): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      // For web storage
      if (method === 'localStorage' || (!method && !window.electron)) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue as T;
      }
      
      // For custom storage service
      if (key === 'posts') {
        const posts = await storageService.getPosts();
        return posts as unknown as T;
      }
      
      // If this is electron but not a known key, fall back to localStorage
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue as T;
    } catch (err) {
      console.error(`Error loading data for key "${key}":`, err);
      setError(`Failed to load data: ${(err as Error).message}`);
      return defaultValue as T;
    } finally {
      setLoading(false);
    }
  }, [method, storageService]);
  
  /**
   * Remove data by key
   */
  const removeData = useCallback(async (key: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For web storage
      if (method === 'localStorage' || (!method && !window.electron)) {
        localStorage.removeItem(key);
        return true;
      }
      
      // For posts in custom storage - treat as clearing
      if (key === 'posts') {
        return await storageService.savePosts([]);
      }
      
      // If this is electron but not a known key, fall back to localStorage
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing data for key "${key}":`, err);
      setError(`Failed to remove data: ${(err as Error).message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [method, storageService]);
  
  /**
   * Save posts (wrapper for the storage service)
   */
  const savePosts = useCallback(async (posts: Post[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await storageService.savePosts(posts);
      return result;
    } catch (err) {
      console.error('Error saving posts:', err);
      setError(`Failed to save posts: ${(err as Error).message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storageService]);
  
  /**
   * Load posts (wrapper for the storage service)
   */
  const loadPosts = useCallback(async (): Promise<Post[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const posts = await storageService.getPosts();
      return posts;
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(`Failed to load posts: ${(err as Error).message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [storageService]);
  
  /**
   * Delete a post (wrapper for the storage service)
   */
  const deletePost = useCallback(async (postId: string): Promise<Post[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPosts = await storageService.deletePost(postId);
      return updatedPosts;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(`Failed to delete post: ${(err as Error).message}`);
      return await storageService.getPosts(); // Return current posts as fallback
    } finally {
      setLoading(false);
    }
  }, [storageService]);
  
  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    saveData,
    loadData,
    removeData,
    savePosts,
    loadPosts,
    deletePost,
    error,
    loading,
    clearError
  };
}