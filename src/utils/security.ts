// src/utils/security.ts

/**
 * Security utility functions for the client-side application
 * Note: For true security, always validate on the server side too
 */

/**
 * Sanitize text to prevent XSS attacks
 */
export function sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;');
  }
  
  /**
   * Creates a content hash for a file using Web Crypto API
   * (Browser-compatible way to hash file content)
   */
  export async function createFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || !event.target.result) {
            throw new Error('Failed to read file');
          }
          
          // Get the file buffer
          const buffer = event.target.result instanceof ArrayBuffer 
            ? event.target.result 
            : new TextEncoder().encode(event.target.result as string).buffer;
          
          // Use Web Crypto API for hashing (SHA-256)
          if (window.crypto && window.crypto.subtle) {
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
          } else {
            // Fallback for browsers without crypto.subtle
            // Simple hash based on file properties (less secure)
            const simpleHash = `${file.name}-${file.size}-${file.lastModified}`;
            resolve(simpleHash);
          }
        } catch (err) {
          console.error('Error creating file hash:', err);
          reject(err);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Verify a file against its hash
   */
  export async function verifyFileHash(file: File, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await createFileHash(file);
      return actualHash === expectedHash;
    } catch (err) {
      console.error('Error verifying file hash:', err);
      return false;
    }
  }
  
  /**
   * Check URL safety
   * Prevents linking to potentially malicious URLs
   */
  export function isSafeUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const parsedUrl = new URL(url);
      
      // Block javascript: URLs
      if (parsedUrl.protocol === 'javascript:') {
        return false;
      }
      
      // Allow common protocols
      const safeProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
      if (!safeProtocols.includes(parsedUrl.protocol)) {
        return false;
      }
      
      return true;
    } catch (err) {
      // Invalid URL format
      return false;
    }
  }
  
  /**
   * Generate a secure random ID
   * Use when crypto.randomUUID is not available
   */
  export function generateSecureId(): string {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Convert to hex string
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Detect potentially dangerous content in user input
   * This is useful for early warnings before submission
   */
  export function detectDangerousContent(text: string): boolean {
    if (!text) return false;
    
    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /javascript:/i,
      /on\w+=/i, // onclick, onload, etc.
      /eval\(/i,
      /document\.cookie/i,
      /localStorage/i,
      /sessionStorage/i
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Create a nonce for use with Content-Security-Policy
   */
  export function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }