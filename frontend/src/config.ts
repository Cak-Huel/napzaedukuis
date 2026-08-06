// Dynamic configuration to allow local network/mobile device testing
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const port = typeof window !== 'undefined' ? window.location.port : '';

// Jika development (diakses lewat port Vite 5173), tembak langsung ke Express port 5000.
// Jika production (diakses lewat domain tanpa port 5000), gunakan reverse proxy Nginx.
export const API_BASE_URL = (port === '5173' || port === '3000')
  ? `${protocol}//${hostname}:5000`
  : `${protocol}//${hostname}`;

export const API_URL = `${API_BASE_URL}/api`;
