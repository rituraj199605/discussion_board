// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// We'll initialize the store after importing it dynamically
let store;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
let handleSquirrelEvents = false;
try {
  const electronSquirrelStartup = require('electron-squirrel-startup');
  handleSquirrelEvents = electronSquirrelStartup;
} catch (e) {
  // electron-squirrel-startup module not found, ignore
  console.log("electron-squirrel-startup not found, skipping Windows installer events");
}

if (handleSquirrelEvents) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security: disable Node.js integration in renderer
      contextIsolation: true, // Security: enable context isolation
      preload: path.join(__dirname, 'preload.js') // Use a preload script
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  // In production, load the bundled app
  // In development, load from the dev server
  const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  try {
    // Dynamically import electron-store (ES Module)
    const Store = require('electron-store');
    
    // Initialize store for persistent storage
    store = new Store({
      name: 'community-forum',
      defaults: {
        savedPosts: []
      }
    });

    createWindow();
  } catch (error) {
    console.error('Error initializing store:', error);
    createWindow();
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Set up IPC (Inter-Process Communication) handlers for data persistence
// Renamed from getTweets to getPosts to reflect new functionality
ipcMain.handle('getPosts', async () => {
  if (!store) {
    try {
      const Store = require('electron-store');
      store = new Store({
        name: 'community-forum',
        defaults: {
          savedPosts: []
        }
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      return [];
    }
  }
  return store.get('savedPosts');
});

// Renamed from saveTweets to savePosts
ipcMain.handle('savePosts', async (event, posts) => {
  if (!store) {
    try {
      const Store = require('electron-store');
      store = new Store({
        name: 'community-forum',
        defaults: {
          savedPosts: []
        }
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      return false;
    }
  }
  store.set('savedPosts', posts);
  return true;
});

// Renamed from deleteTweet to deletePost
ipcMain.handle('deletePost', async (event, postId) => {
  if (!store) {
    try {
      const Store = require('electron-store');
      store = new Store({
        name: 'community-forum',
        defaults: {
          savedPosts: []
        }
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      return [];
    }
  }
  const posts = store.get('savedPosts');
  
  // Find and delete the post, whether it's a top-level post or a reply
  const updatedPosts = posts.map(post => {
    // Keep this post if it's not the one to delete
    if (post.id !== postId) {
      // Check if any replies need to be deleted
      if (post.replies && post.replies.length > 0) {
        post.replies = post.replies.filter(reply => reply.id !== postId);
      }
      return post;
    }
    return null; // This will filter out the deleted post
  }).filter(Boolean); // Remove null entries
  
  store.set('savedPosts', updatedPosts);
  return updatedPosts;
});

// Add like functionality
ipcMain.handle('likePost', async (event, data) => {
  if (!store) {
    try {
      const Store = require('electron-store');
      store = new Store({
        name: 'community-forum',
        defaults: {
          savedPosts: []
        }
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      return false;
    }
  }
  
  try {
    const { postId, userId } = data;
    if (!postId || !userId) {
      return false;
    }
    
    const posts = store.get('savedPosts');
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (!post.likedBy.includes(userId)) {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, userId]
          };
        }
        return post;
      }
      
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
    
    store.set('savedPosts', updatedPosts);
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
});