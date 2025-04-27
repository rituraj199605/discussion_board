// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Secure IPC channels - whitelist of allowed channels
const validChannels = [
  'getPosts',
  'savePosts',
  'deletePost',
  'likePost',
  'addReply'
];

// Input validation helpers
const isValidPostId = (id: string): boolean => {
  return typeof id === 'string' && id.trim().length > 0;
};

const isValidPostsArray = (posts: any): boolean => {
  return Array.isArray(posts);
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // For persistent storage
    tweetStorage: {
      // Only expose specific functions with validation
      getTweets: async () => {
        return await ipcRenderer.invoke('getPosts');
      },
      
      saveTweets: async (posts: any) => {
        // Validate posts before sending to main process
        if (!isValidPostsArray(posts)) {
          console.error('Invalid posts data');
          return false;
        }
        return await ipcRenderer.invoke('savePosts', posts);
      },
      
      deleteTweet: async (postId: string) => {
        // Validate postId before sending to main process
        if (!isValidPostId(postId)) {
          console.error('Invalid post ID');
          return [];
        }
        return await ipcRenderer.invoke('deletePost', postId);
      },
      
      likePost: async (postId: string, userId: string) => {
        // Validate inputs
        if (!isValidPostId(postId) || !isValidPostId(userId)) {
          console.error('Invalid post or user ID');
          return false;
        }
        return await ipcRenderer.invoke('likePost', { postId, userId });
      }
    },
    
    // System information (safe to expose)
    system: {
      version: process.getSystemVersion(),
      platform: process.platform
    },
    
    // App version info
    app: {
      version: process.env.APP_VERSION || '1.0.0',
      name: 'Community Forum'
    }
  }
);