// src/utils/validators.ts

/**
 * Validate that text is not empty
 */
export function validateRequired(value: string): string | null {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    return null;
  }
  
  /**
   * Validate text length
   */
  export function validateLength(value: string, min: number, max: number): string | null {
    if (!value) return null;
    
    const length = value.trim().length;
    
    if (length < min) {
      return `Must be at least ${min} characters`;
    }
    
    if (length > max) {
      return `Must be less than ${max} characters`;
    }
    
    return null;
  }
  
  /**
   * Validate text contains no script tags or potential XSS content
   */
  export function validateNoScriptTags(value: string): string | null {
    if (!value) return null;
    
    // Check for script tags, iframes, and other potentially dangerous HTML
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /onclick=/gi,
      /onerror=/gi,
      /onload=/gi,
      /eval\(/gi,
      /document\.cookie/gi,
      /document\.domain/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return 'Contains potentially harmful content';
      }
    }
    
    return null;
  }
  
  /**
   * Validate a username
   */
  export function validateUsername(username: string): string | null {
    if (!username) return 'Username is required';
    
    // Check length
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    
    if (username.length > 30) {
      return 'Username must be less than 30 characters';
    }
    
    // Check for valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    return null;
  }
  
  /**
   * Validate an email address
   */
  export function validateEmail(email: string): string | null {
    if (!email) return null;
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email address';
    }
    
    return null;
  }
  
  /**
   * Validate a URL
   */
  export function validateUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      // Use URL constructor for validation
      new URL(url);
      return null;
    } catch (err) {
      return 'Invalid URL';
    }
  }
  
  /**
   * Validate file type
   */
  export function validateFileType(file: File, allowedTypes: string[]): string | null {
    if (!file) return null;
    
    // Get file extension
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    // Check MIME type
    const mimeType = file.type;
    
    // Check if the file type is allowed
    const isTypeAllowed = allowedTypes.some(type => {
      // Check if the type ends with the extension or matches the mime type
      return type.endsWith(fileExt || '') || type === mimeType;
    });
    
    if (!isTypeAllowed) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    return null;
  }
  
  /**
   * Validate file size
   */
  export function validateFileSize(file: File, maxSizeInBytes: number): string | null {
    if (!file) return null;
    
    if (file.size > maxSizeInBytes) {
      const maxSizeMB = maxSizeInBytes / (1024 * 1024);
      return `File size exceeds the maximum limit of ${maxSizeMB} MB`;
    }
    
    return null;
  }
  
  /**
   * Validate post content
   */
  export function validatePostContent(
    text: string, 
    options: { minLength?: number; maxLength?: number } = {}
  ): string | null {
    const { minLength = 1, maxLength = 5000 } = options;
    
    // Check if empty
    if (!text || text.trim() === '') {
      return 'Post content is required';
    }
    
    // Check length
    const lengthError = validateLength(text, minLength, maxLength);
    if (lengthError) return lengthError;
    
    // Check for potentially harmful content
    const scriptError = validateNoScriptTags(text);
    if (scriptError) return scriptError;
    
    return null;
  }