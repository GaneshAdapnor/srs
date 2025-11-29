/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitize HTML content
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Escape special characters for use in regex
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Validate and sanitize name
 */
export const sanitizeName = (name: string): string => {
  return name.trim().replace(/[<>]/g, '');
};

/**
 * Validate and sanitize address
 */
export const sanitizeAddress = (address: string): string => {
  return address.trim().replace(/[<>]/g, '');
};

