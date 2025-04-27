// src/services/media/mediaService.ts
import { MediaFile } from '../../types';
import { createFileHash, verifyFileHash } from '../../utils/security';

/**
 * Service for handling media operations
 */
export const mediaService = {
  /**
   * Create a MediaFile object from a File
   */
  async createMediaFile(file: File): Promise<MediaFile> {
    try {
      // Determine file type
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      
      // Generate content hash for security
      const contentHash = await createFileHash(file);
      
      // Create the media file object
      const mediaFile: MediaFile = {
        id: crypto.randomUUID ? crypto.randomUUID() : `media-${Date.now()}`,
        type: fileType as 'image' | 'video',
        url: fileUrl,
        name: file.name,
        size: file.size,
        contentHash
      };
      
      return mediaFile;
    } catch (error) {
      console.error('Error creating MediaFile:', error);
      throw new Error('Failed to process media file');
    }
  },
  
  /**
   * Verify a media file's integrity
   */
  async verifyMedia(mediaFile: MediaFile, file: File): Promise<boolean> {
    try {
      // If no content hash, can't verify
      if (!mediaFile.contentHash) {
        return false;
      }
      
      return await verifyFileHash(file, mediaFile.contentHash);
    } catch (error) {
      console.error('Error verifying media file:', error);
      return false;
    }
  },
  
  /**
   * Validate file type against allowed types
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    if (!file) return false;
    
    // Get MIME type
    const mimeType = file.type;
    
    // If no specific types provided, allow image and video
    if (!allowedTypes || allowedTypes.length === 0) {
      return mimeType.startsWith('image/') || mimeType.startsWith('video/');
    }
    
    // Check if file type is in allowed types
    return allowedTypes.some(type => {
      // Handle wildcard types (e.g., 'image/*')
      if (type.endsWith('/*')) {
        const prefix = type.split('/')[0];
        return mimeType.startsWith(`${prefix}/`);
      }
      
      return type === mimeType;
    });
  },
  
  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeInBytes: number): boolean {
    if (!file) return false;
    
    return file.size <= maxSizeInBytes;
  },
  
  /**
   * Clean up a media file (revoke object URL)
   */
  cleanupMediaFile(mediaFile: MediaFile): void {
    try {
      if (mediaFile && mediaFile.url) {
        URL.revokeObjectURL(mediaFile.url);
      }
    } catch (error) {
      console.error('Error cleaning up media file:', error);
    }
  },
  
  /**
   * Format file size into human-readable string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Get icon for file type
   */
  getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'file';
    }
  }
};