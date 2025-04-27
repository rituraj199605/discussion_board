// src/services/storage/electronStorage.ts
import { Post, StorageServiceInterface } from '../../types';

// Security helpers
const validatePost = (post: Post): boolean => {
  // Basic validation to prevent malicious data
  if (!post || typeof post !== 'object') return false;
  if (typeof post.id !== 'string') return false;
  if (typeof post.text !== 'string') return false;
  if (typeof post.author !== 'object' || !post.author) return false;
  if (typeof post.author.name !== 'string') return false;
  if (typeof post.timestamp !== 'string') return false;
  if (typeof post.likes !== 'number') return false;
  if (!Array.isArray(post.replies)) return false;
  if (!Array.isArray(post.likedBy)) return false;
  
  // Recursively validate replies
  for (const reply of post.replies) {
    if (!validatePost(reply)) return false;
  }
  
  return true;
};

const sanitizePost = (post: Post): Post => {
  // Prevent XSS by sanitizing text content
  // This is a simplified example - in production use a proper sanitizer library
  const sanitizeText = (text: string): string => {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  return {
    ...post,
    text: sanitizeText(post.text),
    author: {
      ...post.author,
      name: sanitizeText(post.author.name)
    },
    replies: post.replies.map(reply => sanitizePost(reply))
  };
};

export const electronStorage: StorageServiceInterface = {
  async getPosts(): Promise<Post[]> {
    try {
      if (!window.electron) {
        throw new Error('Electron API not available');
      }
      
      const posts = await window.electron.tweetStorage.getTweets();
      
      // Validate and sanitize each post
      if (!Array.isArray(posts)) {
        console.error('Invalid data format from storage');
        return [];
      }
      
      return posts
        .filter(post => validatePost(post))
        .map(post => sanitizePost(post));
    } catch (error) {
      console.error('Error loading posts from Electron storage:', error);
      return [];
    }
  },
  
  async savePosts(posts: Post[]): Promise<boolean> {
    try {
      if (!window.electron) {
        throw new Error('Electron API not available');
      }
      
      // Validate posts
      if (!Array.isArray(posts)) {
        throw new Error('Invalid posts data');
      }
      
      // Validate and sanitize each post
      const validatedPosts = posts
        .filter(post => validatePost(post))
        .map(post => sanitizePost(post));
      
      return await window.electron.tweetStorage.saveTweets(validatedPosts);
    } catch (error) {
      console.error('Error saving posts to Electron storage:', error);
      return false;
    }
  },
  
  async deletePost(postId: string): Promise<Post[]> {
    try {
      if (!window.electron) {
        throw new Error('Electron API not available');
      }
      
      // Validate postId
      if (typeof postId !== 'string' || !postId.trim()) {
        throw new Error('Invalid post ID');
      }
      
      const updatedPosts = await window.electron.tweetStorage.deleteTweet(postId);
      
      // Validate returned data
      if (!Array.isArray(updatedPosts)) {
        throw new Error('Invalid response from delete operation');
      }
      
      return updatedPosts
        .filter(post => validatePost(post))
        .map(post => sanitizePost(post));
    } catch (error) {
      console.error('Error deleting post:', error);
      return await this.getPosts();
    }
  },
  
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      // Validate IDs
      if (typeof postId !== 'string' || !postId.trim()) {
        throw new Error('Invalid post ID');
      }
      if (typeof userId !== 'string' || !userId.trim()) {
        throw new Error('Invalid user ID');
      }
      
      const posts = await this.getPosts();
      
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
          post.replies = post.replies.map(reply => {
            if (reply.id === postId && !reply.likedBy.includes(userId)) {
              return {
                ...reply,
                likes: reply.likes + 1,
                likedBy: [...reply.likedBy, userId]
              };
            }
            return reply;
          });
        }
        return post;
      });
      
      await this.savePosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },
  
  async addReply(parentId: string, reply: Post): Promise<void> {
    try {
      // Validate IDs and data
      if (typeof parentId !== 'string' || !parentId.trim()) {
        throw new Error('Invalid parent post ID');
      }
      if (!validatePost(reply)) {
        throw new Error('Invalid reply data');
      }
      
      const posts = await this.getPosts();
      
      const updatedPosts = posts.map(post => {
        if (post.id === parentId) {
          return {
            ...post,
            replies: [...post.replies, sanitizePost(reply)]
          };
        }
        return post;
      });
      
      await this.savePosts(updatedPosts);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }
};