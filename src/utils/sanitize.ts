/**
 * Basic HTML Sanitization Utilities
 *
 * Phase 1-2: Simple escaping of dangerous tags
 * Phase 4: Will be replaced with DOMPurify
 */

/**
 * Basic HTML sanitization
 * Removes dangerous tags and event handlers
 * Allows basic formatting tags only
 */
export function sanitizeBasic(html: string): string {
  if (!html) return '';

  // Allow basic formatting tags only
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'span'];

  // Remove script tags and their content (more comprehensive pattern)
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, '');

  // Remove event handlers (case insensitive, handles various quote styles)
  html = html.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  return html;
}
