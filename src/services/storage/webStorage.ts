// src/services/storage/webStorage.ts
import { Post, StorageServiceInterface } from '../../types';
import { sanitizeText } from '../../utils/security';

/**
 * WebStorage implementation for browser localStorage
 */
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
          return {
            ...post,
            replies: post.replies.map(reply => 
              reply.id === postId 
                ? { ...reply, isDeleted: true } 
                : reply
            )
          };
        }
        return post;
      });
      
      // Filter out deleted posts for the returned result
      const filteredPosts = updatedPosts.filter(post => !post.isDeleted);
      
      // Save the updated posts (including soft-deleted ones marked with isDeleted)
      await this.savePosts(updatedPosts);
      
      return filteredPosts;
    } catch (error) {
      console.error('Error deleting post:', error);
      return await this.getPosts();
    }
  },
  
  async likePost(postId: string, userId: string): Promise<void> {
    try {
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
      
      await this.savePosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },
  
  async addReply(parentId: string, reply: Post): Promise<void> {
    try {
      const posts = await this.getPosts();
      
      // Sanitize the reply text for security
      const sanitizedReply = {
        ...reply,
        text: sanitizeText(reply.text),
        author: {
          ...reply.author,
          name: sanitizeText(reply.author.name)
        }
      };
      
      const updatedPosts = posts.map(post => {
        if (post.id === parentId) {
          return {
            ...post,
            replies: [...post.replies, sanitizedReply]
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