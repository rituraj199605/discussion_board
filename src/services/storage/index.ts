// src/services/storage/index.ts
import { Post, StorageMethod, StorageServiceInterface } from '../../types';
import { webStorage } from './webStorage';
import { electronStorage } from './electronStorage';

/**
 * Factory function to get the appropriate storage service
 * based on the environment and options
 */
export function getStorageService(method?: StorageMethod): StorageServiceInterface {
  // Auto-detect if method is not specified
  if (!method) {
    method = typeof window !== 'undefined' && window.electron !== undefined 
      ? 'electron' 
      : 'localStorage';
  }
  
  return method === 'electron' ? electronStorage : webStorage;
}

// src/services/storage/webStorage.ts
export const webStorage: StorageServiceInterface = {
  async getPosts(): Promise<Post[]> {
    try {
      const postsString = localStorage.getItem('community-forum-posts');
      return postsString ? JSON.parse(postsString) : [];
    } catch (error) {
      console.error('Error loading posts from localStorage:', error);
      return [];
    }
  },
  
  async savePosts(posts: Post[]): Promise<boolean> {
    try {
      // Validate posts before saving
      if (!Array.isArray(posts)) {
        throw new Error('Invalid posts data');
      }
      
      localStorage.setItem('community-forum-posts', JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
      return false;
    }
  },
  
  async deletePost(postId: string): Promise<Post[]> {
    try {
      const posts = await this.getPosts();
      
      // Handle post deletion, including nested replies
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return { ...post, isDeleted: true };
        }
        
        if (post.replies && post.replies.length > 0) {
          post.replies = post.replies.map(reply => 
            reply.id === postId 
              ? { ...reply, isDeleted: true } 
              : reply
          );
        }
        return post;
      });
      
      await this.savePosts(updatedPosts);
      return updatedPosts.filter(post => !post.isDeleted);
    } catch (error) {
      console.error('Error deleting post:', error);
      return await this.getPosts();
    }
  },
  
  async likePost(postId: string, userId: string): Promise<void> {
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
  },
  
  async addReply(parentId: string, reply: Post): Promise<void> {
    const posts = await this.getPosts();
    
    const updatedPosts = posts.map(post => {
      if (post.id === parentId) {
        return {
          ...post,
          replies: [...post.replies, reply]
        };
      }
      return post;
    });
    
    await this.savePosts(updatedPosts);
  }
};