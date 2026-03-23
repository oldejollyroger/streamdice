import { TMDB_API_KEY, TMDB_BASE_URL } from './config.js';

export const api = {
    _fetch: async (path, params = {}) => {
        const url = new URL(`${TMDB_BASE_URL}/${path}`);
        url.searchParams.append('api_key', TMDB_API_KEY);
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined) url.searchParams.append(key, val);
        });
        const res = await fetch(url);
        return res.json();
    },
    discoverMedia: (type, params) => api._fetch(`discover/${type}`, params),
    getFullDetails: (type, id, lang) => api._fetch(`${type}/${id}`, { language: lang, append_to_response: 'videos' })
};