// electron/security/validators.ts

/**
 * Validates post data to prevent malicious input
 */
export function validatePostData(posts: any): boolean {
    // Check if it's an array
    if (!Array.isArray(posts)) {
      return false;
    }
    
    // Validate each post
    for (const post of posts) {
      if (!validatePost(post)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate an individual post object
   */
  export function validatePost(post: any): boolean {
    if (!post || typeof post !== 'object') return false;
    
    // Required fields
    if (typeof post.id !== 'string' || !post.id.trim()) return false;
    if (typeof post.text !== 'string') return false;
    
    // Author validation
    if (!post.author || typeof post.author !== 'object') return false;
    if (typeof post.author.id !== 'string' || !post.author.id.trim()) return false;
    if (typeof post.author.name !== 'string') return false;
    
    // Other field validations
    if (typeof post.timestamp !== 'string') return false;
    if (typeof post.likes !== 'number' || post.likes < 0) return false;
    
    // Arrays
    if (!Array.isArray(post.likedBy)) return false;
    if (!Array.isArray(post.replies)) return false;
    
    // Media validation if present
    if (post.media) {
      if (!Array.isArray(post.media)) return false;
      
      for (const media of post.media) {
        if (!validateMedia(media)) return false;
      }
    }
    
    // Validate nested replies recursively
    for (const reply of post.replies) {
      if (!validatePost(reply)) return false;
    }
    
    return true;
  }
  
  /**
   * Validate media object
   */
  export function validateMedia(media: any): boolean {
    if (!media || typeof media !== 'object') return false;
    
    if (typeof media.id !== 'string' || !media.id.trim()) return false;
    if (typeof media.type !== 'string' || !['image', 'video'].includes(media.type)) return false;
    if (typeof media.url !== 'string') return false;
    if (typeof media.name !== 'string') return false;
    
    return true;
  }
  
  /**
   * Validate post ID
   */
  export function validatePostId(id: any): boolean {
    return typeof id === 'string' && id.trim().length > 0;
  }
  
  /**
   * Sanitize post data to prevent XSS and other injection attacks
   */
  export function sanitizePostData(posts: any[]): any[] {
    return posts.map(post => sanitizePost(post));
  }
  
  /**
   * Sanitize an individual post
   */
  export function sanitizePost(post: any): any {
    // Create a sanitized copy
    const sanitized = {
      ...post,
      text: sanitizeText(post.text),
      author: {
        ...post.author,
        name: sanitizeText(post.author.name)
      },
      replies: post.replies.map((reply: any) => sanitizePost(reply))
    };
    
    // Sanitize media if present
    if (post.media) {
      sanitized.media = post.media.map((m: any) => ({
        ...m,
        name: sanitizeText(m.name)
      }));
    }
    
    return sanitized;
  }
  
  /**
   * Basic text sanitization to prevent XSS
   * Note: In production, use a proper sanitization library
   */
  function sanitizeText(text: string): string {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
      .replace(/\(/g, '&#40;')
      .replace(/\)/g, '&#41;');
  }