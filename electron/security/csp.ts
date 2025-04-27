// electron/security/csp.ts

/**
 * Returns a Content Security Policy for the application
 * to mitigate XSS and other injection attacks.
 */
export function getContentSecurityPolicy(): string {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Base CSP directives
    const directives = {
      // Default: only allow resources from the same origin
      'default-src': ["'self'"],
      
      // Scripts: only allow from same origin and disable inline scripts
      'script-src': [
        "'self'",
        // Allow eval during development for React hot reloading
        isDev ? "'unsafe-eval'" : '',
      ].filter(Boolean),
      
      // Styles: allow from same origin and inline styles (for Tailwind)
      'style-src': ["'self'", "'unsafe-inline'"],
      
      // Images: allow from same origin and data URLs (for encoded images)
      'img-src': ["'self'", 'data:'],
      
      // Fonts: allow from same origin
      'font-src': ["'self'"],
      
      // Connect: only allow to same origin
      'connect-src': [
        "'self'", 
        // Allow WebSocket connections to dev server
        isDev ? 'ws://localhost:*' : '',
      ].filter(Boolean),
      
      // Media: only allow from same origin
      'media-src': ["'self'", 'blob:'],
      
      // Object: disallow all object/embed content
      'object-src': ["'none'"],
      
      // Frame and worker restrictions
      'frame-src': ["'self'"],
      'worker-src': ["'self'", 'blob:'],
      
      // Form actions: only to same origin
      'form-action': ["'self'"],
      
      // Base URI: restrict to same origin
      'base-uri': ["'self'"],
      
      // Upgrade insecure requests
      'upgrade-insecure-requests': [],
      
      // Frame ancestors: prevent embedding in iframes
      'frame-ancestors': ["'self'"],
      
      // Block mixed content
      'block-all-mixed-content': [],
    };
    
    // Convert the directives object to a string
    return Object.entries(directives)
      .map(([key, values]) => {
        if (values.length === 0) return key;
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
  }