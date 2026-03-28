// config.js
const TMDB_API_KEY = "22f17214f2c35b01940cdfed47d738c2";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_THUMBNAIL_BASE_URL = "https://image.tmdb.org/t/p/w185";

const CURATED_COUNTRY_LIST = new Set([
  'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 
  'FI', 'FR', 'DE', 'GR', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 
  'JP', 'KR', 'MY', 'MX', 'NL', 'NZ', 'NO', 'PE', 'PH', 'PL', 
  'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'ES', 'SE', 'CH', 'TH', 
  'TR', 'UA', 'AE', 'GB', 'US', 'VE'
]);

const ACCENT_COLORS = [
  { name: 'Purple', color: '#a855f7', text: '#d8b4fe', from: '#a855f7', to: '#ec4899' },
  { name: 'Blue', color: '#3b82f6', text: '#93c5fd', from: '#3b82f6', to: '#06b6d4' },
  { name: 'Green', color: '#22c55e', text: '#86efac', from: '#22c55e', to: '#14b8a6' },
  { name: 'Orange', color: '#f97316', text: '#fdba74', from: '#f97316', to: '#eab308' },
  { name: 'Pink', color: '#ec4899', text: '#f9a8d4', from: '#ec4899', to: '#f43f5e' },
  { name: 'Red', color: '#ef4444', text: '#fca5a5', from: '#ef4444', to: '#f97316' }
];