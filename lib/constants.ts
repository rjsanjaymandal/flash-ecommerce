export const SITE_URL = 
  process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://flashhfashion.in' 
    : 'http://localhost:3000');
