// API Configuration
// In production, use relative URLs since client and server are on same domain
// In development, use localhost
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default API_URL;

