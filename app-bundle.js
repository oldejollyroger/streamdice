// helpers.js

function formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
}

function normalizeMediaData(media, mediaType, genresMap) {
    if (!media || !media.id) return null;
    const type = (media.media_type || mediaType);
    const isMovie = type === 'movie';
    const releaseDate = isMovie ? media.release_date : media.first_air_date;
    return {
        id: media.id.toString(),
        title: isMovie ? media.title : media.name,
        synopsis: media.overview,
        year: releaseDate ? parseInt(releaseDate.split('-')[0]) : null,
        imdbRating: media.vote_average?.toFixed(1) || 'N/A',
        genres: media.genre_ids?.map(id => genresMap[id]).filter(Boolean) || [],
        poster: media.poster_path,
        mediaType: type
    };
}

const { useState, useEffect, useCallback, useMemo, useRef } = React;

// hooks.js

function useLocalStorageState(key, defaultValue) {
    const { useState, useEffect } = React;
    const [state, setState] = useState(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                return defaultValue;
            }
        }
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            console.error(`Error setting localStorage key "${key}":`, e);
        }
    }, [key, state]);

    return [state, setState];
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
// components.js (v0.0.6 - Stable)

const InstallPwaInstructions = ({ t }) => ( <div className="install-button-wrapper"><div className="bg-gray-800 text-white text-center text-sm p-3 rounded-lg shadow-lg flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span>{t.installInstructions}</span></div></div> );
const InstallPwaButton = ({ t, handleInstallClick }) => ( <div className="install-button-wrapper"><button onClick={handleInstallClick} className="bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{t.installApp}</button></div> );
const SettingsDropdown = ({ mode, setMode, accent, setAccent, language, setLanguage, tmdbLanguage, setTmdbLanguage, tmdbLanguages, t, openWatchedModal, openWatchlistModal, openRegionSelector }) => { const [isOpen, setIsOpen] = useState(false); const dropdownRef = useRef(null); useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []); return ( <div className="relative" ref={dropdownRef}><button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full bg-white/10 shadow border border-white/10 hover:border-white/20" aria-label="Settings"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>{isOpen && ( <div className="absolute right-0 mt-2 w-64 modal-content shadow-2xl z-30"><div className="p-4"><h3 className="font-semibold mb-3">{t.settings}</h3><div className="space-y-4">
    <div className="flex items-center justify-center gap-2 p-2 rounded-full overflow-hidden bg-black/10">{ACCENT_COLORS.map(c => (<button key={c.name} onClick={() => setAccent(c)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${accent.name === c.name ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-accent)]' : ''}`} style={{backgroundColor: c.color}} title={c.name}></button>))}</div>
    <div className="flex items-center gap-2 bg-black/10 p-1 rounded-full"><button onClick={() => setMode('light')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>Light</button><button onClick={() => setMode('dark')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>Dark</button></div>
    <div>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mt-3 mb-1">Site Language</label>
        <div className="flex items-center bg-black/10 p-1 rounded-full">
            <button onClick={() => setLanguage('en')} className={`w-full lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button>
            <button onClick={() => setLanguage('es')} className={`w-full lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button>
        </div>
    </div>
    <div><label htmlFor="tmdb-language-select" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.contentLanguage}</label><select id="tmdb-language-select" value={tmdbLanguage} onChange={(e)=> setTmdbLanguage(e.target.value)} className="w-full p-2 bg-black/10 border border-slate-700 rounded-lg text-sm text-[var(--color-text-primary)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]">{tmdbLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
    <button onClick={()=>{setIsOpen(false); openWatchlistModal();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z"/></svg>{t.watchList}</button>
    <button onClick={()=>{setIsOpen(false); openWatchedModal();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>{t.watchedList}</button>
    <button onClick={()=>{setIsOpen(false); openRegionSelector();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>{t.changeCountry}</button>
</div></div></div>)}</div> );};
const WatchedMediaModal = ({ isOpen, close, watchedMedia, handleUnwatchMedia, mediaType, t }) => { if (!isOpen) return null; const watchedArray = Object.values(watchedMedia).filter(m => m.mediaType === mediaType); return ( <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4" onClick={close}><div className="modal-content max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.watchedList} ({mediaType === 'movie' ? t.movies : t.tvShows})</h2><button onClick={close} className="text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div><div className="p-6 overflow-y-auto space-y-4">{watchedArray.length > 0 ? ( watchedArray.map((media) => (<div key={media.id} className="user-list-item"><img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={media.title}/><div className="user-list-item-info"><div className="user-list-item-title">{media.title}</div><div className="user-list-item-year">{media.year}</div></div><button onClick={() => handleUnwatchMedia(media.id)} className="text-xs bg-red-600 text-white font-bold py-1 px-3 rounded-full hover:bg-red-700 transition-colors flex-shrink-0">{t.unwatch}</button></div>)) ) : (<p className="text-slate-400">Your watched list is empty for {mediaType === 'movie' ? t.movies.toLowerCase() : t.tvShows.toLowerCase()}.</p>)}</div><div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 text-right"><button onClick={close} className="px-6 py-2 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-500">Close</button></div></div></div> ); };
const WatchlistModal = ({ isOpen, close, watchlist, handleToggleWatchlist, mediaType, t }) => { if (!isOpen) return null; const watchlistArray = Object.values(watchlist).filter(m => m.mediaType === mediaType); return ( <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4" onClick={close}><div className="modal-content max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.watchList} ({mediaType === 'movie' ? t.movies : t.tvShows})</h2><button onClick={close} className="text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div><div className="p-6 overflow-y-auto space-y-4">{watchlistArray.length > 0 ? (watchlistArray.map((media) => (<div key={media.id} className="user-list-item"><img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={media.title}/><div className="user-list-item-info"><div className="user-list-item-title">{media.title}</div><div className="user-list-item-year">{media.year}</div></div><button onClick={() => handleToggleWatchlist(media)} className="text-xs bg-slate-600 text-white font-bold py-1 px-3 rounded-full hover:bg-slate-700 transition-colors flex-shrink-0">{t.removeFromList}</button></div>))) : (<p className="text-slate-400">Your watchlist is empty for {mediaType === 'movie' ? t.movies.toLowerCase() : t.tvShows.toLowerCase()}.</p>)}</div><div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 text-right"><button onClick={close} className="px-6 py-2 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-500">Close</button></div></div></div> );};
const ActorDetailsModal = ({ isOpen, close, actorDetails, isFetching, t }) => {
    if (!isOpen) return null;
    const popularMedia = useMemo(() => {
        if (!actorDetails) return [];
        return (actorDetails?.movie_credits?.cast || [])
            .concat(actorDetails?.tv_credits?.cast || [])
            .filter(m => m.poster_path && m.vote_count > 50)
            .map(m => ({ ...m, score: m.popularity + (m.vote_count / 1000) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);
    }, [actorDetails]);
    return ( <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4" onClick={close}><div className="modal-content max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}><button onClick={close} className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 z-10"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>{isFetching || !actorDetails ? (<div className="h-96 flex items-center justify-center"><div className="loader"></div></div>) : (<div className="overflow-y-auto"><div className="sm:grid sm:grid-cols-3 sm:gap-x-8 p-6"><div className="sm:col-span-1"><img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={actorDetails.profile_path ? `${TMDB_IMAGE_BASE_URL}${actorDetails.profile_path}` : 'https://placehold.co/500x750/4A5568/FFFFFF?text=?'} alt={`Photo of ${actorDetails.name}`}/></div><div className="sm:col-span-2 mt-4 sm:mt-0"><h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{actorDetails.name}</h2><p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-h-60 overflow-y-auto">{actorDetails.biography || "No biography available."}</p></div></div><div className="p-4 sm:p-6 bg-black/20 dark:bg-black/20 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">Known For</h3>{popularMedia?.length > 0 ? ( <div className="horizontal-scroll-container">{popularMedia.map(m => ( <div key={m.id} className="flex-shrink-0 w-32 text-center group"><div className="w-full aspect-[2/3] bg-[var(--color-card-border)] rounded-lg overflow-hidden"><img loading="lazy" src={m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=No+Poster'} alt={m.title || m.name} className="w-full h-full object-cover"/></div><span className="block w-full text-xs text-center text-[var(--color-text-secondary)] pt-2 truncate">{m.title || m.name}</span></div>))}</div> ) : <p className="text-sm text-[var(--color-text-secondary)]">No other popular media found.</p>}</div></div>)}</div></div> );
};
const MediaCardContent = ({ media, details, isFetching, t, userRegion, handleActorClick }) => {
    const displayDetails = isFetching ? {} : details;
    return (
        <React.Fragment>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm text-left">
                <div className="flex items-center gap-4">
                    <span><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {media.year}</span>
                    {displayDetails.certification && <span className="border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{displayDetails.certification}</span>}
                </div>
                {isFetching ? <div className="inline-flex items-center"><div className="small-loader"></div></div> : media.mediaType === 'movie' && displayDetails.duration ? <div><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(displayDetails.duration)}</div> : null}
                {isFetching ? <div className="inline-flex items-center"><div className="small-loader"></div></div> : media.mediaType === 'tv' && displayDetails.seasons ? <div><strong className="text-[var(--color-accent-text)]">{t.cardSeasons}</strong> {displayDetails.seasons}</div> : null}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {media.imdbRating}/10 ⭐</div>
                {isFetching ? null : (displayDetails.director || displayDetails.created_by?.length > 0) && <div><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {displayDetails.director?.name || displayDetails.created_by?.map(c => c.name).join(', ')}</div>}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardGenres}</strong> {media.genres.join(', ')}</div>
                <div><strong className="text-[var(--color-accent-text)] block mb-1">{`${t.cardAvailableOn} ${userRegion}`}</strong>{isFetching ? <div className="small-loader"></div> : displayDetails.providers?.length > 0 ? (<div className="flex flex-wrap gap-2 items-center">{displayDetails.providers.map(p => ( <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Watch on ${p.provider_name}`}><img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/></a>))}</div>) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}</div>
                {isFetching ? null : displayDetails.rentalProviders?.length > 0 && (<div><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardAvailableToRent}</strong><div className="flex flex-wrap gap-2 items-center">{displayDetails.rentalProviders.map(p => (<a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Rent or buy on ${p.provider_name}`}><img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/></a>))}</div></div>)}
                <div><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong>{isFetching ? <div className="small-loader"></div> : displayDetails.cast?.length > 0 ? (<div className="horizontal-scroll-container">{displayDetails.cast.slice(0,10).map(actor => (<button key={actor.id} onClick={() => handleActorClick(actor.id)} className="flex-shrink-0 w-20 text-center group hover:scale-105 transition-transform"><img loading="lazy" src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/><span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors leading-tight">{actor.name}</span></button>))}</div>) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}</div>
            </div>
        </React.Fragment>
    );
};
const MemoizedMediaCardContent = React.memo(MediaCardContent);
const FilterModal = ({ isOpen, close, handleClearFilters, filters, handleFilterChange, handleGenreChangeInModal, genresMap, allPlatformOptions, platformSearchQuery, setPlatformSearchQuery, handlePlatformChange, t }) => { if (!isOpen) return null; const filteredPlatforms = allPlatformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())); return ( <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4" onClick={close}><div className="modal-content max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2><button onClick={close} className="text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div><div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto">
    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.includeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`inc-${id}`} className="flex items-center"><input id={`inc-genre-${id}`} type="checkbox" checked={filters.genre.includes(id)} onChange={() => handleGenreChangeInModal(id, 'genre')} disabled={filters.excludeGenres.includes(id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50"/><label htmlFor={`inc-genre-${id}`} className={`ml-3 text-base text-[var(--color-text-secondary)] ${filters.excludeGenres.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`ex-${id}`} className="flex items-center"><input id={`ex-genre-${id}`} type="checkbox" checked={filters.excludeGenres.includes(id)} onChange={() => handleGenreChangeInModal(id, 'excludeGenres')} disabled={filters.genre.includes(id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50"/><label htmlFor={`ex-genre-${id}`} className={`ml-3 text-base text-[var(--color-text-secondary)] ${filters.genre.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.platform}</label><input type="text" value={platformSearchQuery} onChange={(e) => setPlatformSearchQuery(e.target.value)} placeholder={t.platformSearchPlaceholder} className="w-full p-2 mb-3 bg-[var(--color-bg)] border-[var(--color-card-border)] rounded-md text-sm" /><div className="filter-checkbox-list space-y-2">{filteredPlatforms.map(p => (<div key={`modal-p-${p.id}`} className="flex items-center"><input id={`modal-platform-${p.id}`} type="checkbox" checked={filters.platform.includes(p.id)} onChange={() => handlePlatformChange(p.id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`modal-platform-${p.id}`} className="ml-3 text-base text-[var(--color-text-secondary)]">{p.name}</label></div>))}</div></div>
</div><div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-4"><button onClick={()=>{handleClearFilters(); close();}} className="px-6 py-2 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-500">{t.clearFilters}</button><button onClick={close} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg">{t.applyFilters}</button></div></div></div> ); };
const SkeletonMediaCard = () => ( <div className="w-full max-w-4xl mx-auto container-style overflow-hidden mb-10 animate-pulse"><div className="sm:grid sm:grid-cols-3 sm:gap-x-8"><div className="sm:col-span-1 p-6"><div className="w-full h-auto mx-auto aspect-[2/3] bg-slate-200 dark:bg-slate-700 rounded-lg"></div></div><div className="sm:col-span-2 p-6 space-y-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div><div className="space-y-3 mt-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div></div></div></div></div>);
const SimilarMediaModal = ({ media, close, t, fetchFullMediaDetails, handleActorClick, userRegion, handleSimilarMediaClick, openTrailerModal }) => { if (!media) return null; const [details, setDetails] = useState(media); const [isFetching, setIsFetching] = useState(true); useEffect(() => { setIsFetching(true); setDetails({}); fetchFullMediaDetails(media.id, media.mediaType).then(d => { if (d) setDetails(d); }).finally(() => setIsFetching(false)); }, [media.id, media.mediaType, fetchFullMediaDetails]); return ( <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4" onClick={close}><div className="modal-content max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}><button onClick={close} className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 z-10"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>{isFetching || !details.id ? ( <div className="h-96 flex items-center justify-center"><div className="loader"></div></div> ) : ( <div className="overflow-y-auto"><div className="sm:grid sm:grid-cols-3 sm:gap-x-8"><div className="sm:col-span-1 p-4 sm:p-6"><img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : 'https://placehold.co/500x750/1f2937/FFFFFF?text=No+Image'} alt={`Poster for ${details.title || details.name}`}/>{!isFetching && details.trailerKey && (<div className="mt-4 flex justify-center"><button onClick={()=>openTrailerModal(details.trailerKey)} className="w-full max-w-[300px] flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)]/20 text-[var(--color-accent-text)] font-bold rounded-lg shadow-md transition-colors hover:bg-[var(--color-accent)]/30"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>{t.cardTrailer}</button></div>)}</div> <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0"><div className="text-center sm:text-left"><h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{details.title || details.name}</h2><p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{details.overview}</p></div><div className="mt-6 pt-4 border-t border-[var(--color-card-border)]"><h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3><MemoizedMediaCardContent media={media} details={details} isFetching={isFetching} t={t} userRegion={userRegion} handleActorClick={handleActorClick}/></div></div></div> <div className="p-4 sm:p-6 bg-black/20 dark:bg-black/20 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">{t.cardSimilarMovies}</h3>{isFetching ? <div className="flex justify-center"><div className="small-loader"></div></div> : details.similar?.length > 0 ? (<div className="horizontal-scroll-container">{details.similar.map(m => (<button key={m.id} onClick={() => handleSimilarMediaClick(m)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150"><div className="w-full aspect-[2/3] bg-[var(--color-card-border)] rounded-lg overflow-hidden"><img loading="lazy" src={m.poster ? `${TMDB_IMAGE_BASE_URL}${m.poster}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=N/A'} alt={m.title} className="w-full h-full object-cover"/></div><span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">{m.title}</span></button>))}</div>) : <p className="text-sm text-[var(--color-text-secondary)] text-sm">{t.noMoviesFound}</p>}</div></div> )}</div></div> );};
const TrailerModal = ({ isOpen, close, trailerKey }) => {
    if (!isOpen || !trailerKey) return null;
    const youtubeSrc = `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;
    return (
        <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-[60] p-4" onClick={close}>
            <div className="bg-black rounded-xl max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={close} className="absolute -top-3 -right-3 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 z-10" aria-label="Close trailer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <div className="trailer-responsive">
                    <iframe src={youtubeSrc} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Embedded youtube" />
                </div>
            </div>
        </div>
    );
};
const CookieConsentModal = ({ isOpen, onAccept, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
            <div className="max-w-xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="p-4 container-style flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-[var(--color-accent)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12.572l-7.5 7.428-7.5-7.428m15 0A23.978 23.978 0 0012 15.052c-2.738 0-5.3-1-7.5-2.48M15 4.572l-3 3-3-3" /></svg>
                        </span>
                        <p className="ml-3 font-medium text-[var(--color-text-primary)]">
                            <span className="md:hidden">We use cookies.</span>
                            <span className="hidden md:inline">{t.cookieConsent}</span>
                        </p>
                    </div>
                    <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                        <button onClick={onAccept} className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-opacity-80">
                            {t.accept}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// app.js (v0.0.7 - Final Corrected)

const App = () => {
    const [mode, setMode] = useLocalStorageState('movieRandomizerMode', 'dark');
    const [accent, setAccent] = useLocalStorageState('movieRandomizerAccent', ACCENT_COLORS[0]);
    const [language, setLanguage] = useLocalStorageState('movieRandomizerLang', 'en');
    const [tmdbLanguage, setTmdbLanguage] = useLocalStorageState('tmdbContentLang', 'en-US');
    const [userRegion, setUserRegion] = useLocalStorageState('movieRandomizerRegion', null);
    const [mediaType, setMediaType] = useLocalStorageState('mediaPickerType_v1', 'movie');
    const [showRegionSelector, setShowRegionSelector] = useState(() => !localStorage.getItem('movieRandomizerRegion'));
    
    const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0, actor: null, creator: null, duration: 0, ageRating: 0 };
    const [filters, setFilters] = useLocalStorageState('mediaPickerFilters_v4', initialFilters);
    const [cookieConsent, setCookieConsent] = useLocalStorageState('cookieConsent_v1', false);

    const WATCHED_KEY = 'mediaPickerWatched_v2';
    const WATCHLIST_KEY = 'mediaPickerWatchlist_v2';
    const [watchedMedia, setWatchedMedia] = useLocalStorageState(WATCHED_KEY, {});
    const [watchList, setWatchList] = useLocalStorageState(WATCHLIST_KEY, {});
    
    const [allMedia, setAllMedia] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaHistory, setMediaHistory] = useState([]);
    const [mediaDetails, setMediaDetails] = useState({});
    const [shareStatus, setShareStatus] = useState('idle'); 
    const [availableRegions, setAvailableRegions] = useState([]);
    const [quickPlatformOptions, setQuickPlatformOptions] = useState([]);
    const [allPlatformOptions, setAllPlatformOptions] = useState([]);
    const [platformSearchQuery, setPlatformSearchQuery] = useState('');
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [modalMedia, setModalMedia] = useState(null);
    const [modalTrailerKey, setModalTrailerKey] = useState(null);
    const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isWatchedModalOpen, setIsWatchedModalOpen] = useState(false);
    const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
    const [actorDetails, setActorDetails] = useState(null);
    const [isActorModalOpen, setIsActorModalOpen] = useState(false);
    const [isFetchingActorDetails, setIsFetchingActorDetails] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [genresMap, setGenresMap] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const t = translations[language];
    const cardRef = useRef(null);
    const searchRef = useRef(null);
    
    const durationOptions = useMemo(() => [ { label: t.any, gte: 0, lte: 999 }, { label: "< 90 min", gte: 0, lte: 90 }, { label: "90-120 min", gte: 90, lte: 120 }, { label: "> 120 min", gte: 120, lte: 999 } ], [t]);
    const ageRatingOptions = useMemo(() => { const ratings = userRegion === 'US' ? ['G', 'PG', 'PG-13', 'R', 'NC-17'] : ['U', 'PG', '12', '15', '18']; return [t.any, ...ratings]; }, [userRegion, t]);

    const fetchApi = useCallback(async (path, query) => { if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { throw new Error("API Key is missing."); } const params = new URLSearchParams(query); const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`; const response = await fetch(url); if (!response.ok) { const err = await response.json(); throw new Error(err.status_message || `API error: ${response.status}`); } return response.json(); }, []);
    
    const resetAllState = useCallback(() => { setAllMedia([]); setSelectedMedia(null); setHasSearched(false); setMediaHistory([]); }, []);
    const resetAndClearFilters = () => { resetAllState(); setFilters(initialFilters); };
    
    useEffect(() => {
        const doc = document.documentElement;
        doc.classList.remove('light-mode', 'dark-mode');
        doc.classList.add(`${mode}-mode`);
    }, [mode]);

    useEffect(() => { const r = document.documentElement; r.style.setProperty('--color-accent', accent.color); r.style.setProperty('--color-accent-text', accent.text); r.style.setProperty('--color-accent-gradient-from', accent.from); r.style.setProperty('--color-accent-gradient-to', accent.to); }, [accent]);
    useEffect(() => { resetAllState(); }, [language, tmdbLanguage]);
    useEffect(() => { if (userRegion) localStorage.setItem('movieRandomizerRegion', JSON.stringify(userRegion)); }, [userRegion]);
    useEffect(() => { localStorage.setItem('mediaPickerFilters_v4', JSON.stringify(filters)); }, [filters]);
    useEffect(() => { const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream; setIsIos(i); if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true); const p = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener('beforeinstallprompt', p); return () => window.removeEventListener('beforeinstallprompt', p);}, []);

    const openTrailerModal = (key) => { setModalTrailerKey(key); setIsTrailerModalOpen(true); };
    const closeModal = () => { setIsTrailerModalOpen(false); setModalTrailerKey(null); setIsActorModalOpen(false); setModalMedia(null); setIsWatchedModalOpen(false); setIsWatchlistModalOpen(false); setIsFilterModalOpen(false); };
    useEffect(() => { const handleKeyDown = (event) => { if (event.key === 'Escape') closeModal(); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);

    useEffect(() => { const bootstrapApp = async () => { setIsLoading(true); setError(null); try { const regionsData = await fetchApi('configuration/countries', {}); setAvailableRegions(regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a,b)=>a.english_name.localeCompare(b.english_name))); } catch (err) { console.error("Error bootstrapping:", err); setError(err.message); } finally { setIsLoading(false); } }; bootstrapApp(); }, [fetchApi]);
    useEffect(() => { const fetchLanguageData = async () => { if (!tmdbLanguage) return; try { const d = await fetchApi(`genre/${mediaType}/list`, { language: tmdbLanguage }); setGenresMap(d.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {})); } catch (e) { console.error("Error fetching language data:", e); } }; fetchLanguageData(); }, [language, tmdbLanguage, mediaType, fetchApi]);
    useEffect(() => { if (!userRegion) return; const fetchPlatforms = async () => { try { const data = await fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion }); const sorted = data.results.sort((a, b) => (a.display_priorities?.[userRegion] ?? 100) - (b.display_priorities?.[userRegion] ?? 100)); setQuickPlatformOptions(sorted.slice(0, 6).map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); setAllPlatformOptions(sorted.map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); } catch (err) { console.error("Error fetching providers", err); }}; fetchPlatforms();}, [userRegion, mediaType, fetchApi]);
    
    useEffect(() => {
        if (debouncedSearchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const search = async () => {
            try {
                const data = await fetchApi('search/multi', { query: debouncedSearchQuery, language: tmdbLanguage });
                const results = data.results
                    .filter(r => r.media_type === 'movie' || r.media_type === 'tv' || (r.media_type === 'person' && r.profile_path))
                    .map(r => {
                        if (r.media_type === 'person') {
                            return { id: r.id, title: r.name, year: r.known_for_department, poster: r.profile_path, resultType: 'person' };
                        }
                        return { ...normalizeMediaData(r, r.media_type, genresMap), resultType: 'media' };
                    })
                    .filter(Boolean)
                    .slice(0, 7);
                setSearchResults(results);
            } catch (err) { console.error(err); } 
            finally { setIsSearching(false); }
        };
        search();
    }, [debouncedSearchQuery, tmdbLanguage, mediaType, genresMap, fetchApi]);

    const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
        if (!mediaId || !type) return null;
        try {
            const endpoint = type === 'movie' ? `${type}/${mediaId}` : `${type}/${mediaId}`;
            const append_to_response = type === 'movie' ? 'credits,videos,watch/providers,similar,recommendations,release_dates' : 'credits,videos,watch/providers,similar,recommendations,content_ratings';
            const data = await fetchApi(endpoint, { language: tmdbLanguage, append_to_response });
            let certification = '';
            if (type === 'movie') { const releaseDates = data.release_dates?.results || []; const usRelease = releaseDates.find(r => r.iso_3166_1 === userRegion); certification = usRelease?.release_dates.find(rd => rd.certification)?.certification || '';
            } else { const contentRatings = data.content_ratings?.results || []; const usRating = contentRatings.find(r => r.iso_3166_1 === userRegion); certification = usRating?.rating || ''; }
            const director = data.credits?.crew?.find(p => p.job === 'Director');
            const similarMedia = [...(data.recommendations?.results || []), ...(data.similar?.results || [])].filter((v,i,a) => v.poster_path && a.findIndex(t=>(t.id === v.id))===i).map(r => normalizeMediaData(r, type, genresMap)).filter(Boolean).slice(0, 10);
            const regionData = data['watch/providers']?.results?.[userRegion];
            const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`;
            const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
            const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
            const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
            const combinedPayProviders = [...rentProviders, ...buyProviders];
            const uniquePayProviderIds = new Set();
            const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; });
            return { ...data, duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null), providers, rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 10) || [], director, seasons: data.number_of_seasons, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMedia, certification: certification };
        } catch (err) { console.error(`Error fetching details for ${type} ${mediaId}`, err); return null; }
    }, [userRegion, tmdbLanguage, genresMap, fetchApi]);

    useEffect(() => { if (!selectedMedia) return; setIsFetchingDetails(true); setMediaDetails({}); fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => { if (details) setMediaDetails(details); setIsFetchingDetails(false); }); }, [selectedMedia, fetchFullMediaDetails]);
    
    useEffect(() => { if(cookieConsent) {const wm = localStorage.getItem(WATCHED_KEY); const wl = localStorage.getItem(WATCHLIST_KEY); if (wm) { try { setWatchedMedia(JSON.parse(wm)); } catch(e){} } if (wl) { try { setWatchList(JSON.parse(wl)); } catch(e){} }} }, [cookieConsent]);
    useEffect(() => { if(cookieConsent) localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMedia)); }, [watchedMedia, cookieConsent]);
    useEffect(() => { if(cookieConsent) localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchList)); }, [watchList, cookieConsent]);
    
    const handleSurpriseMe = useCallback(async () => {
        if (!userRegion || !Object.keys(genresMap).length) return;
        setIsDiscovering(true);
        setError(null);
        if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
        setSelectedMedia(null);
        setHasSearched(true);
        try {
            const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
            const runtimeParam = mediaType === 'movie' ? 'with_runtime' : 'with_episode_runtime';
            const selectedDuration = durationOptions[filters.duration];
            const ageRatingParams = {};
            if (filters.ageRating > 0) { const allowedRatings = ageRatingOptions.slice(1, filters.ageRating + 1).join('|'); ageRatingParams.certification_country = userRegion; ageRatingParams.certification = allowedRatings; }
            const queryParams = { language: tmdbLanguage, 'vote_count.gte': mediaType === 'movie' ? 200 : 100, watch_region: userRegion, ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') }, ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') }, ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }, ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating }, ...filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` }, ...(filters.actor && { with_cast: filters.actor.id }), ...(filters.creator && { with_crew: filters.creator.id }), ...(filters.duration > 0 && { [`${runtimeParam}.gte`]: selectedDuration.gte, [`${runtimeParam}.lte`]: selectedDuration.lte }), ...ageRatingParams, sort_by: 'popularity.desc' };
    
            const initialData = await fetchApi(`discover/${mediaType}`, queryParams);
            const totalPages = Math.min(initialData.total_pages, 200);
            if (totalPages === 0) { setAllMedia([]); setSelectedMedia(null); setIsDiscovering(false); return; }
            const randomPage = Math.floor(Math.pow(Math.random(), 2) * (totalPages - 1)) + 1;
            const data = randomPage === 1 ? initialData : await fetchApi(`discover/${mediaType}`, { ...queryParams, page: randomPage });
            const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
            const unwatchedMedia = transformedMedia.filter(m => !watchedMedia[m.id]);
    
            setAllMedia(unwatchedMedia);
            if (unwatchedMedia.length > 0) { const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]; setSelectedMedia(newMedia); } 
            else { setSelectedMedia(null); }
        } catch (err) { console.error("Error discovering media:", err); setError(err.message); } 
        finally { setIsDiscovering(false); }
    }, [filters, tmdbLanguage, mediaType, userRegion, genresMap, watchedMedia, selectedMedia, fetchApi, durationOptions, ageRatingOptions]);
    
    const handleRegionChange = (newRegion) => { setUserRegion(newRegion); resetAllState(); setFilters(initialFilters); setShowRegionSelector(false); };
    const handleMediaTypeChange = (type) => { if (type === mediaType) return; resetAllState(); setFilters(initialFilters); setMediaType(type); };
    const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); };
    const handleQuickFilterToggle = (list, id) => { setFilters(f => { const current = [...(f[list] || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, [list]: current }; }); resetAllState(); };
    const handleGenreChangeInModal = (genreId, type) => { setFilters(f => { const list = [...(f[type] || [])]; const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; const otherList = [...(f[otherType] || [])]; const index = list.indexOf(genreId); if (index > -1) list.splice(index, 1); else { list.push(genreId); const otherIndex = otherList.indexOf(genreId); if(otherIndex > -1) otherList.splice(otherIndex, 1); } return {...f, [type]: list, [otherType]: otherList }; }); };
    const handlePlatformChange = (id) => { setFilters(f => { const current = [...(f.platform || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, platform: current }; }); };
    const handleMarkAsWatched = (media) => { const newWatched = {...watchedMedia}; if (newWatched[media.id]) delete newWatched[media.id]; else newWatched[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchedMedia(newWatched); };
    const handleUnwatchMedia = (mediaId) => { const newWatched = {...watchedMedia}; delete newWatched[mediaId]; setWatchedMedia(newWatched); };
    const handleToggleWatchlist = (media) => { const newWatchlist = { ...watchList }; if (newWatchlist[media.id]) delete newWatchlist[media.id]; else newWatchlist[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchList(newWatchlist); };
    const handleGoBack = () => { if(mediaHistory.length === 0) return; const newHistory = [...mediaHistory]; const prev = newHistory.pop(); setMediaHistory(newHistory); setSelectedMedia(prev); };
    const handleShare = useCallback(() => { if (!selectedMedia) return; const url = `https://www.themoviedb.org/${selectedMedia.mediaType}/${selectedMedia.id}`; if (navigator.share) { navigator.share({ title: selectedMedia.title, url }).catch(err => console.error(err)); } else { navigator.clipboard.writeText(url).then(() => { setShareStatus('success'); setTimeout(() => setShareStatus('idle'), 2000); }); } }, [selectedMedia]);
    const handleInstallClick = async () => { if (!installPrompt) return; await installPrompt.prompt(); setInstallPrompt(null); };
    const handleActorClick = async (actorId) => { closeModal(); setIsActorModalOpen(true); setIsFetchingActorDetails(true); fetchApi(`person/${actorId}`, { append_to_response: 'movie_credits,tv_credits' }).then(setActorDetails).catch(console.error).finally(()=>setIsFetchingActorDetails(false)); };
    const handleSimilarMediaClick = (media) => { setModalMedia(normalizeMediaData(media, mediaType, genresMap)); };
    
    const handleSearchResultClick = (result) => {
        if (result.resultType === 'person') {
            const isCreator = result.year === 'Directing' || result.year === 'Writing' || result.year === 'Production';
            setFilters(f => ({
                ...f,
                actor: isCreator ? null : result,
                creator: isCreator ? result : null
            }));
            resetAllState();
        } else {
            if(selectedMedia) setMediaHistory(prev=>[...prev,selectedMedia]);
            setSelectedMedia(result);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const quickFilterGenres = useMemo(() => {
        if(mediaType === 'movie') return [{ id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '53', name: 'Thriller' }];
        return [{ id: '10759', name: 'Action & Adventure' }, { id: '35', name: 'Comedy' }, { id: '10765', name: 'Sci-Fi & Fantasy' }, { id: '80', name: 'Crime' }];
    }, [mediaType]);
    
    const tmdbLanguages = [{code:'en-US',name:'English'},{code:'es-ES',name:'Español'},{code:'fr-FR',name:'Français'},{code:'de-DE',name:'Deutsch'},{code:'it-IT',name:'Italiano'},{code:'pt-PT',name:'Português'},{code:'ru-RU',name:'Русский'},{code:'ja-JP',name:'日本語'},{code:'ko-KR',name:'한국어/조선말'},{code:'zh-CN',name:'中文'}];
    const showInstallButton = installPrompt && !isIos && !isStandalone;
    const showIosInstallInstructions = isIos && !isStandalone;
    const isCurrentMediaWatched = selectedMedia && watchedMedia[selectedMedia.id];
    
    if (isLoading) { return ( <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center"><div className="loader"></div></div> ); }
    if (error) { return ( <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-red-500">{error}</div> ); }
    
    return (
        <div className="min-h-screen p-4 font-sans app-container">
            <div className="absolute top-4 right-4 z-20"><SettingsDropdown mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} language={language} setLanguage={setLanguage} tmdbLanguage={tmdbLanguage} setTmdbLanguage={setTmdbLanguage} tmdbLanguages={tmdbLanguages} t={t} openWatchedModal={()=>setIsWatchedModalOpen(true)} openWatchlistModal={()=>setIsWatchlistModalOpen(true)} openRegionSelector={() => setShowRegionSelector(true)} /></div>
            <header className="text-center mb-4 pt-16 sm:pt-16">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
                <h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2>
                <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                    <button onClick={() => handleMediaTypeChange('movie')} className={`px-4 py-2 rounded-full text-sm w-32 flex items-center justify-center gap-2 media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                        {t.movies}
                    </button>
                    <button onClick={() => handleMediaTypeChange('tv')} className={`px-4 py-2 rounded-full text-sm w-32 flex items-center justify-center gap-2 media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {t.tvShows}
                    </button>
                </div>
                <div className="max-w-xl mx-auto mt-6 flex flex-col items-center gap-4">
                  <div ref={searchRef} className="relative w-full">
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full p-3 pl-10 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"/>
                      <div className="absolute top-0 left-0 inline-flex items-center p-3">{isSearching ? <div className="small-loader !m-0 !w-5 !h-5"></div> : <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}</div>
                      {searchResults.length > 0 && (<div className="absolute w-full mt-2 modal-content shadow-lg z-20 max-h-80 overflow-y-auto"><ul className="py-2">{searchResults.map(result => (<li key={`${result.resultType}-${result.id}`} onClick={() => handleSearchResultClick(result)} className="p-3 hover:bg-black/10 dark:hover:bg-white/5 cursor-pointer flex items-center gap-4"><img loading="lazy" src={result.poster ? `${TMDB_THUMBNAIL_BASE_URL}${result.poster}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={result.title} className="w-12 h-auto rounded-md" /><div className="text-left"><p className="font-semibold text-[var(--color-text-primary)]">{result.title}</p><p className="text-sm text-[var(--color-text-secondary)]">{result.year}</p></div></li>))}</ul>
                      <button onClick={() => setSearchResults([])} className="search-results-close text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>)}
                  </div>
                </div>
            </header>
            <div className="max-w-3xl mx-auto mb-4 p-4 space-y-4 text-center">
              <div><div className="flex flex-wrap justify-center gap-2"> {quickFilterGenres.map(genre => (<button key={genre.id} onClick={() => handleQuickFilterToggle('genre', genre.id)} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.genre.includes(genre.id) ? 'quick-filter-btn-active' : ''}`}>{genre.name}</button>))} </div></div>
              {userRegion && quickPlatformOptions.length > 0 && (<div><div className="flex flex-wrap justify-center gap-2"> {quickPlatformOptions.map(p => (<button key={p.id} onClick={() => handleQuickFilterToggle('platform', p.id)} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.platform.includes(p.id) ? 'quick-filter-btn-active' : ''}`}>{p.name}</button>))} </div></div>)}
            </div>
            <div className="max-w-3xl mx-auto mb-8 p-4 container-style">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-center">
                    <div className="md:col-span-1"><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={(e) => handleFilterChange('decade', e.target.value)} className="w-full p-2 bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
                    <div className="md:col-span-1"><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                    <div className="md:col-span-1"><label htmlFor="duration-filter" className="filter-label"><span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.duration}</span><span className="text-sm font-semibold text-[var(--color-accent-text)]">{durationOptions[filters.duration].label}</span></label><input type="range" id="duration-filter" min="0" max={durationOptions.length - 1} step="1" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                    <div className="md:col-span-1"><label htmlFor="age-rating-filter" className="filter-label"><span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.ageRating}</span><span className="text-sm font-semibold text-[var(--color-accent-text)]">{ageRatingOptions[filters.ageRating]}</span></label><input type="range" id="age-rating-filter" min="0" max={ageRatingOptions.length - 1} step="1" value={filters.ageRating} onChange={(e) => handleFilterChange('ageRating', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                    <button onClick={() => setIsFilterModalOpen(true)} className="w-full sm:col-span-2 md:col-span-2 lg:col-span-1 p-2 bg-white/10 dark:bg-black/20 hover:border-slate-300 dark:hover:border-slate-700 border border-slate-200 dark:border-slate-800 text-[var(--color-text-primary)] font-semibold rounded-full transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>{t.showFilters}</button>
                </div>
            </div>
            <div className="text-center mb-10 flex justify-center items-center gap-4"><button onClick={handleGoBack} disabled={mediaHistory.length===0} className="p-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg></button><button onClick={handleSurpriseMe} disabled={isDiscovering || !userRegion} title={!userRegion ? t.selectRegionPrompt : ''} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isDiscovering ? t.searching : t.surpriseMe}</button></div>
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
                {filters.actor && <div className="filter-pill"><span>{filters.actor.title}</span><button onClick={() => {setFilters(f => ({ ...f, actor: null })); resetAllState();}}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>}
                {filters.creator && <div className="filter-pill"><span>{filters.creator.title}</span><button onClick={() => {setFilters(f => ({ ...f, creator: null })); resetAllState();}}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>}
                {filters.platform.map(id => (allPlatformOptions.find(p=>p.id===id)?.name) && <div key={`pill-p-${id}`} className="filter-pill"><span>{allPlatformOptions.find(p=>p.id===id).name}</span><button onClick={() => handleQuickFilterToggle('platform', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>)}
                {filters.genre.map(id => genresMap[id] && <div key={`pill-g-${id}`} className="filter-pill"><span>{genresMap[id]}</span><button onClick={() => handleQuickFilterToggle('genre', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>)}
            </div>
            {isDiscovering ? <SkeletonMediaCard /> : selectedMedia ? (
                 <div ref={cardRef} className="w-full max-w-4xl mx-auto overflow-hidden mb-10 movie-card-enter container-style">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-x-8">
                        <div className="sm:col-span-1 p-4 sm:p-6"><img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={selectedMedia.poster ? `${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}` : 'https://placehold.co/500x750/1f2937/FFFFFF?text=No+Image'} alt={`Poster for ${selectedMedia.title}`}/>{!isFetchingDetails && mediaDetails.trailerKey && (<div className="mt-4 flex justify-center"><button onClick={()=>openTrailerModal(mediaDetails.trailerKey)} className="w-full max-w-[300px] flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)]/20 text-[var(--color-accent-text)] font-bold rounded-lg shadow-md transition-colors hover:bg-[var(--color-accent)]/30"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>{t.cardTrailer}</button></div>)}</div>
                        <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0">
                            <div className="text-center sm:text-left"><h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{selectedMedia.title}</h2><p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{selectedMedia.synopsis}</p></div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => handleMarkAsWatched(selectedMedia)} className={`w-full py-3 px-4 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 ${isCurrentMediaWatched ? 'bg-green-600/80 hover:bg-green-600' : 'bg-red-600/80 hover:bg-red-600' }`}>
                                    {isCurrentMediaWatched ? <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg><span>{t.cardIsWatched}</span></> : t.cardMarkAsWatched}
                                </button>
                                <button onClick={() => handleToggleWatchlist(selectedMedia)} className="w-full py-3 px-4 bg-sky-600/80 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">{watchList[selectedMedia.id] ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>}{t.saveForLater}</button>
                                <button onClick={handleShare} className="w-full py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>{shareStatus === 'success' ? t.shareSuccess : t.shareButton}</button>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--color-card-border)]"><h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3><MemoizedMediaCardContent media={selectedMedia} details={mediaDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} handleActorClick={handleActorClick}/></div>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-black/20 dark:bg-black/20 border-t border-[var(--color-card-border)]"><h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">{t.cardSimilarMovies}</h3>{isFetchingDetails ? <div className="flex justify-center"><div className="small-loader"></div></div> : mediaDetails.similar?.length > 0 ? (<div className="horizontal-scroll-container">{mediaDetails.similar.map(media => (<button key={media.id} onClick={()=>handleSimilarMediaClick(media)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150"><div className="w-full aspect-[2/3] bg-[var(--color-card-border)] rounded-lg overflow-hidden"><img loading="lazy" src={media.poster ? `${TMDB_IMAGE_BASE_URL}${media.poster}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=N/A'} alt={media.title} className="w-full h-full object-cover"/></div><span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">{media.title}</span></button>))}</div>) : <p className="text-sm text-[var(--color-text-secondary)] text-sm">{t.noMoviesFound}</p>}</div>
                </div>
            ) : ( <div className="text-center text-gray-400 mt-10 text-lg">{ hasSearched && allMedia.length === 0 && !isDiscovering ? (<div><p>{t.noMoviesFound}</p><button onClick={resetAndClearFilters} className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg">{t.clearAllFilters}</button></div>) : !hasSearched && t.welcomeMessage}</div> )}
            
            <TrailerModal isOpen={isTrailerModalOpen} close={() => closeModal()} trailerKey={modalTrailerKey} />
            <FilterModal isOpen={isFilterModalOpen} close={()=>setIsFilterModalOpen(false)} handleClearFilters={resetAndClearFilters} filters={filters} handleGenreChangeInModal={handleGenreChangeInModal} handlePlatformChange={handlePlatformChange} genresMap={genresMap} allPlatformOptions={allPlatformOptions} platformSearchQuery={platformSearchQuery} setPlatformSearchQuery={setPlatformSearchQuery} t={t} />
            <WatchedMediaModal isOpen={isWatchedModalOpen} close={()=>setIsWatchedModalOpen(false)} watchedMedia={watchedMedia} handleUnwatchMedia={handleUnwatchMedia} mediaType={mediaType} t={t} cookieConsent={cookieConsent}/>
            <WatchlistModal isOpen={isWatchlistModalOpen} close={()=>setIsWatchlistModalOpen(false)} watchlist={watchList} handleToggleWatchlist={handleToggleWatchlist} mediaType={mediaType} t={t} cookieConsent={cookieConsent}/>
            <ActorDetailsModal isOpen={isActorModalOpen} close={()=>closeModal()} actorDetails={actorDetails} isFetching={isFetchingActorDetails} t={t}/>
            <SimilarMediaModal media={modalMedia} close={()=>closeModal()} fetchFullMediaDetails={fetchFullMediaDetails} handleActorClick={handleActorClick} handleSimilarMediaClick={handleSimilarMediaClick} t={t} userRegion={userRegion} openTrailerModal={openTrailerModal} />
            <CookieConsentModal isOpen={userRegion && !cookieConsent} onAccept={() => setCookieConsent(true)} t={t} />
            
            {(showRegionSelector || !userRegion) && ( <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-40"><div className="standalone-modal-content text-center max-w-md p-8 shadow-2xl"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>{availableRegions.length > 0 ? (<select id="initial-region-filter" onChange={(e) => handleRegionChange(e.target.value)} defaultValue="" className="w-full p-3 bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="" disabled>-- {t.region} --</option>{availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}</select>) : (<div className="loader"></div>)}</div></div>)}
            <footer className="text-center mt-auto py-4 text-sm text-[var(--color-text-subtle)]">{showInstallButton && <InstallPwaButton t={t} handleInstallClick={handleInstallClick}/>}{showIosInstallInstructions && <InstallPwaInstructions t={t}/>}<p className="pt-4">{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p></footer>
        </div>
    );
};

// script.js (v0.0.6 - Stable)

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const CURATED_COUNTRY_LIST = new Set([ 'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US' ]);
const ACCENT_COLORS = [ 
    { name: 'Cyberpunk', color: '#a855f7', text: '#d8b4fe', from: '#a855f7', to: '#ec4899' },
    { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' },
    { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' },
    { name: 'Crimson', color: '#ef4444', text: '#fca5a5', from: '#ef4444', to: '#ef4444' },
    { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' }
];

const translations = {
    es: { movies: 'Películas', tvShows: 'Series', settings: "Ajustes", watchedList: "Vistos", unwatch: "Quitar", watchList: "Mi Lista", saveForLater: "Guardar", removeFromList: "Quitar", installApp: "Instalar App", installInstructions: "Para instalar, presiona el ícono de Compartir y luego 'Agregar a la pantalla de inicio'", title: 'Movie & TV Randomizer', subtitle: '¿Qué vemos esta noche?', platforms: "Plataformas Populares", changeCountry: "Cambiar País", contentLanguage: "Idioma del Contenido", advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Más Filtros', hideFilters: 'Ocultar Filtros', applyFilters: 'Aplicar Filtros', region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca un título o persona...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para empezar!", noMoviesFound: 'No se encontraron resultados con los filtros actuales.', cardYear: 'Año:', cardDuration: 'Duración:', cardSeasons: "Temporadas:", cardRating: 'Nota TMDb:', cardDirector: 'Director/Creador:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: "Marcar como Visto", cardIsWatched: "Visto", cardTrailer: 'Ver Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Títulos Similares', footer: 'Datos cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', clearAllFilters: 'Limpiar todos los filtros', details: "Detalles", movieDuration: "Duración de Película (min)", episodeDuration: "Duración de Episodio (min)", ageRating: "Clasificación por Edad", duration: "Duración", any: "Cualquiera", person: "Persona", cookieConsent: "Este sitio guarda tus listas en tu navegador.", accept: "Aceptar" },
    en: { movies: "Movies", tvShows: "TV Shows", settings: "Settings", watchedList: "Watched List", unwatch: "Un-watch", watchList: "My List", saveForLater: "Save for Later", removeFromList: "Remove", installApp: "Install App", installInstructions: "To install, tap the Share icon and then 'Add to Home Screen'", title: 'Movie & TV Randomizer', subtitle: "What should we watch tonight?", platforms: "Popular Platforms", changeCountry: "Change Country", contentLanguage: "Content Language", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'More Filters', hideFilters: 'Hide Filters', applyFilters: 'Apply Filters', region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a title or person...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to start!", noMoviesFound: 'No results found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardSeasons: 'Seasons:', cardRating: 'TMDb Rating:', cardDirector: 'Director/Creator:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Mark as Watched", cardIsWatched: "Watched", cardTrailer: 'Watch Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Titles', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', clearAllFilters: 'Clear All Filters', details: "Details", movieDuration: "Movie Duration (min)", episodeDuration: "Episode Duration (min)", ageRating: "Age Rating", duration: "Duration", any: "Any", person: "Person", cookieConsent: "This site stores your lists in your browser.", accept: "Accept" }
};

ReactDOM.render(<App />, document.getElementById('root'));