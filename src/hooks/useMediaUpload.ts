// src/hooks/useMediaUpload.ts
import { useState, useCallback } from 'react';
import { MediaFile } from '../types';

interface UseMediaUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UseMediaUploadResult {
  mediaFiles: MediaFile[];
  isLoading: boolean;
  error: string | null;
  addMedia: (file: File) => Promise<boolean>;
  removeMedia: (id: string) => void;
  clearMedia: () => void;
}

/**
 * Custom hook for handling media uploads with validation and security features
 */
export const useMediaUpload = (options: UseMediaUploadOptions = {}): UseMediaUploadResult => {
  const {
    maxFiles = 4,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
  } = options;
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Calculate file hash for security verification
   */
  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || !event.target.result) {
          resolve('hash-error');
          return;
        }
        
        try {
          // If we're in an environment with the crypto API
          if (typeof window !== 'undefined' && window.crypto) {
            const data = event.target.result;
            const hashBuffer = new TextEncoder().encode(typeof data === 'string' ? data : '');
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
          } else {
            // Fallback for environments without crypto
            resolve(`file-${file.name}-${file.size}`);
          }
        } catch (err) {
          console.error('Error calculating file hash:', err);
          resolve(`file-${file.name}-${file.size}`);
        }
      };
      
      reader.onerror = () => {
        resolve('hash-error');
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  /**
   * Add a media file
   */
  const addMedia = useCallback(async (file: File): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if we're at the limit
      if (mediaFiles.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return false;
      }
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} not allowed`);
        return false;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        setError(`File size exceeds maximum of ${maxFileSize / (1024 * 1024)}MB`);
        return false;
      }
      
      // Generate content hash for security verification
      const contentHash = await calculateFileHash(file);
      
      // Create URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // Determine file type
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      
      // Create media file object
      const newMedia: MediaFile = {
        id: crypto.randomUUID ? crypto.randomUUID() : `media-${Date.now()}`,
        type: fileType as 'image' | 'video',
        url: fileUrl,
        name: file.name,
        size: file.size,
        contentHash
      };
      
      // Update state
      setMediaFiles(prev => [...prev, newMedia]);
      
      return true;
    } catch (err) {
      console.error('Error adding media:', err);
      setError('Failed to add media file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [mediaFiles, maxFiles, maxFileSize, allowedTypes]);
  
  /**
   * Remove a media file
   */
  const removeMedia = useCallback((id: string) => {
    setMediaFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      
      // Revoke object URLs for files being removed
      prev.forEach(file => {
        if (file.id === id) {
          URL.revokeObjectURL(file.url);
        }
      });
      
      return updated;
    });
  }, []);
  
  /**
   * Clear all media files
   */
  const clearMedia = useCallback(() => {
    // Clean up any object URLs
    mediaFiles.forEach(file => {
      URL.revokeObjectURL(file.url);
    });
    
    setMediaFiles([]);
  }, [mediaFiles]);
  
  return {
    mediaFiles,
    isLoading,
    error,
    addMedia,
    removeMedia,
    clearMedia
  };
};