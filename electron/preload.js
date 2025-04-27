// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // For persistent storage - keeping the same API structure
    // but changing it to handle discussion posts instead of tweets
    tweetStorage: {
      // Keeping the same method names for backward compatibility
      getTweets: () => ipcRenderer.invoke('getPosts'),
      saveTweets: (posts) => ipcRenderer.invoke('savePosts', posts),
      deleteTweet: (postId) => ipcRenderer.invoke('deletePost', postId)
    }
  }
);