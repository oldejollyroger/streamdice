import { TMDB_API_KEY, TMDB_BASE_URL } from './config.js';

export const api = {
    _fetch: async function(path, queryParams = {}) {
        const params = new URLSearchParams(queryParams);
        const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            return response.json();
        } catch (err) {
            console.error("Error en API:", err);
            throw err;
        }
    },

    getGenres: (mediaType, language) => api._fetch(`genre/${mediaType}/list`, { language }),
    getPlatforms: (mediaType, region) => api._fetch(`watch/providers/${mediaType}`, { watch_region: region }),
    discoverMedia: (mediaType, queryParams) => api._fetch(`discover/${mediaType}`, queryParams),
    getFullDetails: (mediaType, mediaId, language) => {
        const append = mediaType === 'movie' 
            ? 'credits,videos,watch/providers,similar,release_dates' 
            : 'credits,videos,watch/providers,similar,content_ratings';
        return api._fetch(`${mediaType}/${mediaId}`, { language, append_to_response: append });
    },
    getCountries: () => api._fetch('configuration/countries')
};