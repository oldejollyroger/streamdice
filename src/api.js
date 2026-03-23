import { TMDB_API_KEY, TMDB_BASE_URL } from './config.js';

export const api = {
    _fetch: async (path, params = {}) => {
        const url = new URL(`${TMDB_BASE_URL}/${path}`);
        url.searchParams.append('api_key', TMDB_API_KEY);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error de conexión con TMDB');
        return res.json();
    },

    getGenres: (type) => api._fetch(`genre/${type}/list`),

    discoverMedia: (type, params) => 
        api._fetch(`discover/${type}`, { 
            ...params, 
            with_watch_monetization_types: 'flatrate',
            include_adult: false,
            sort_by: 'popularity.desc'
        }),

    getFullDetails: (type, id) => {
        const append = type === 'movie' ? 'videos,release_dates' : 'videos,content_ratings';
        return api._fetch(`${type}/${id}`, { append_to_response: append });
    }
};