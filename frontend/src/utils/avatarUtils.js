/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'AN';
  
  const parts = name.trim().split(/\s+/).filter(Boolean);
  
  if (parts.length === 0) return 'AN';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  // Get first letter of first name and first letter of last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate an SVG data URL for avatar with a user icon (for users without profile images)
 * @returns {string} - Data URL for SVG image with user icon
 */
export const generateDefaultAvatar = () => {
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#000000"/>
      <g transform="translate(100, 100)">
        <circle cx="0" cy="-15" r="25" fill="#C19A4A"/>
        <path d="M -40 50 Q -40 10, 0 10 Q 40 10, 40 50 Z" fill="#C19A4A"/>
      </g>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate an SVG data URL for avatar with initials
 * @param {string} name - Full name
 * @returns {string} - Data URL for SVG image
 */
export const generateInitialsAvatar = (name) => {
  const initials = getInitials(name);
  
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#000000"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="80" 
        font-weight="bold" 
        fill="#C19A4A"
      >${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
