// components.js (v1.2.0 - Optimized)

const { useState, useEffect, useMemo, useRef } = React;

// Constants for fallback images
const FALLBACK_POSTER = 'https://placehold.co/300x450/1f2937/9ca3af?text=No+Image';
const FALLBACK_PROFILE = 'https://placehold.co/185x278/1f2937/9ca3af?text=No+Photo';
const FALLBACK_LOGO = 'https://placehold.co/40x40/1f2937/9ca3af?text=?';

// Image component with error handling
const SafeImage = React.memo(({ src, alt, fallback, className, loading = "lazy", ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback || FALLBACK_POSTER);
    }
  };

  return (
    <img
      src={imgSrc || fallback || FALLBACK_POSTER}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
});

const InstallPwaInstructions = React.memo(({ t }) => (
  <div className="install-button-wrapper">
    <p className="text-sm text-[var(--color-text-secondary)] text-center px-4">
      {t.installInstructions}
    </p>
  </div>
));

const InstallPwaButton = React.memo(({ t, handleInstallClick }) => (
  <div className="install-button-wrapper">
    <button onClick={handleInstallClick} className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
      {t.installApp}
    </button>
  </div>
));

const SettingsDropdown = React.memo(({ mode, setMode, accent, setAccent, language, setLanguage, tmdbLanguage, setTmdbLanguage, tmdbLanguages, t, openWatchedModal, openWatchlistModal, openRegionSelector }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full bg-white/10 shadow border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" aria-label="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-xl shadow-2xl z-50 modal-content border border-[var(--color-card-border)] space-y-4">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{t.settings}</h3>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button key={c.name} onClick={() => setAccent(c)} className={`w-6 h-6 rounded-full transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${accent.name === c.name ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-accent)]' : ''}`} style={{backgroundColor: c.color}} title={c.name}></button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/10 rounded-full">
            <button onClick={() => setMode('light')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 focus:outline-none ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.061l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" /></svg>
              Light
            </button>
            <button onClick={() => setMode('dark')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 focus:outline-none ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" /></svg>
              Dark
            </button>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Site Language</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/10 rounded-full">
              <button onClick={() => setLanguage('en')} className={`w-full lang-btn focus:outline-none ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button>
              <button onClick={() => setLanguage('es')} className={`w-full lang-btn focus:outline-none ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-secondary)]">{t.contentLanguage}</label>
            <select value={tmdbLanguage} onChange={(e) => setTmdbLanguage(e.target.value)} className="w-full p-2 bg-black/10 border border-slate-700 rounded-lg text-sm text-[var(--color-text-primary)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]">
              {tmdbLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 pt-2 border-t border-[var(--color-card-border)]">
            <button onClick={() => {setIsOpen(false); openWatchlistModal();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
              {t.watchList}
            </button>
            <button onClick={() => {setIsOpen(false); openWatchedModal();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t.watchedList}
            </button>
            <button onClick={() => {setIsOpen(false); openRegionSelector();}} className="w-full p-2 text-sm text-left bg-black/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              {t.changeCountry}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// List item component for virtualization-ready lists
const MediaListItem = React.memo(({ media, onAction, actionLabel, actionClass }) => (
  <div className="user-list-item">
    <SafeImage 
      src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : FALLBACK_POSTER}
      alt={`${media.title}/`}
      fallback={FALLBACK_POSTER}
    />
    <div className="user-list-item-info">
      <p className="user-list-item-title">{media.title}</p>
      <p className="user-list-item-year">{media.year}</p>
    </div>
    <button onClick={() => onAction(media)} className={`text-xs font-bold py-1 px-3 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${actionClass}`}>
      {actionLabel}
    </button>
  </div>
));

const WatchedMediaModal = React.memo(({ isOpen, close, watchedMedia, handleUnwatchMedia, mediaType, t, cookieConsent }) => {
  if (!isOpen) return null;
  const watchedArray = Object.values(watchedMedia).filter(m => m.mediaType === mediaType);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-lg max-h-[80vh] flex flex-col modal-content p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{t.watchedList} ({mediaType === 'movie' ? t.movies : t.tvShows})</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {watchedArray.length > 0 ? (
            watchedArray.map((media) => (
              <MediaListItem 
                key={media.id}
                media={media}
                onAction={() => handleUnwatchMedia(media.id)}
                actionLabel={t.unwatch}
                actionClass="bg-red-600 text-white hover:bg-red-700"
              />
            ))
          ) : (
            <p className="text-center text-[var(--color-text-secondary)] py-8">
              Your watched list is empty for {mediaType === 'movie' ? t.movies.toLowerCase() : t.tvShows.toLowerCase()}.
            </p>
          )}
        </div>
        <button onClick={close} className="mt-4 w-full py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">Close</button>
      </div>
    </div>
  );
});

const WatchlistModal = React.memo(({ isOpen, close, watchlist, handleToggleWatchlist, mediaType, t, cookieConsent }) => {
  if (!isOpen) return null;
  const watchlistArray = Object.values(watchlist).filter(m => m.mediaType === mediaType);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-lg max-h-[80vh] flex flex-col modal-content p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{t.watchList} ({mediaType === 'movie' ? t.movies : t.tvShows})</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {watchlistArray.length > 0 ? (
            watchlistArray.map((media) => (
              <MediaListItem 
                key={media.id}
                media={media}
                onAction={handleToggleWatchlist}
                actionLabel={t.removeFromList}
                actionClass="bg-slate-600 text-white hover:bg-slate-700"
              />
            ))
          ) : (
            <p className="text-center text-[var(--color-text-secondary)] py-8">
              Your watchlist is empty for {mediaType === 'movie' ? t.movies.toLowerCase() : t.tvShows.toLowerCase()}.
            </p>
          )}
        </div>
        <button onClick={close} className="mt-4 w-full py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">Close</button>
      </div>
    </div>
  );
});

const ActorDetailsModal = React.memo(({ isOpen, close, actorDetails, isFetching, t }) => {
  const popularMedia = useMemo(() => {
    if (!actorDetails) return [];
    return (actorDetails?.movie_credits?.cast || [])
      .concat(actorDetails?.tv_credits?.cast || [])
      .filter(m => m.poster_path && m.vote_count > 50)
      .map(m => ({ ...m, score: m.popularity + (m.vote_count / 1000) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [actorDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content p-6" onClick={e => e.stopPropagation()}>
        {isFetching || !actorDetails ? (
          <div className="flex justify-center items-center h-64"><span className="loader"></span></div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SafeImage
                src={actorDetails.profile_path ? `${TMDB_IMAGE_BASE_URL}${actorDetails.profile_path}` : FALLBACK_PROFILE}
                alt={`Photo of ${actorDetails.name}`}
                fallback={FALLBACK_PROFILE}
                className="w-32 h-48 object-cover rounded-lg mx-auto sm:mx-0 flex-shrink-0"
              />
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{actorDetails.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2 line-clamp-6">{actorDetails.biography || "No biography available."}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Known For</h3>
              {popularMedia?.length > 0 ? (
                <div className="horizontal-scroll-container">
                  {popularMedia.map(m => (
                    <div key={`${m.id}-${m.media_type || 'media'}`} className="flex-shrink-0 w-24 text-center">
                      <SafeImage
                        src={`${TMDB_THUMBNAIL_BASE_URL}${m.poster_path}`}
                        alt={m.title || m.name}
                        fallback={FALLBACK_POSTER}
                        className="actor-thumbnail"
                      />
                      <p className="text-xs mt-1 text-[var(--color-text-secondary)] truncate">{m.title || m.name}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[var(--color-text-secondary)]">No other popular media found.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const MediaCardContent = React.memo(({ media, details, isFetching, t, userRegion, handleActorClick }) => {
  const displayDetails = isFetching ? {} : details;
  
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <p><strong className="text-[var(--color-text-secondary)]">{t.cardYear}</strong> {media.year}</p>
        {displayDetails.certification && <span className="px-2 py-0.5 text-xs font-bold border border-[var(--color-text-secondary)] rounded">{displayDetails.certification}</span>}
      </div>
      
      {isFetching ? (
        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
      ) : media.mediaType === 'movie' && displayDetails.duration ? (
        <p><strong className="text-[var(--color-text-secondary)]">{t.cardDuration}</strong> {formatDuration(displayDetails.duration)}</p>
      ) : null}
      
      {isFetching ? (
        <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
      ) : media.mediaType === 'tv' && displayDetails.seasons ? (
        <p><strong className="text-[var(--color-text-secondary)]">{t.cardSeasons}</strong> {displayDetails.seasons}</p>
      ) : null}
      
      <p><strong className="text-[var(--color-text-secondary)]">{t.cardRating}</strong> {media.imdbRating}/10 ⭐</p>
      
      {isFetching ? null : (displayDetails.director || displayDetails.created_by?.length > 0) && (
        <p><strong className="text-[var(--color-text-secondary)]">{t.cardDirector}</strong> {displayDetails.director?.name || displayDetails.created_by?.map(c => c.name).join(', ')}</p>
      )}
      
      <p><strong className="text-[var(--color-text-secondary)]">{t.cardGenres}</strong> {media.genres.join(', ')}</p>
      
      <div>
        <p className="font-semibold text-[var(--color-text-primary)] mb-2"><strong>{`${t.cardAvailableOn} ${userRegion}`}</strong></p>
        {isFetching ? (
          <div className="flex gap-2"><span className="small-loader"></span></div>
        ) : displayDetails.providers?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayDetails.providers.map(p => (
              <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Watch on ${p.provider_name}`}>
                <SafeImage
                  src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`}
                  alt={p.provider_name}
                  fallback={FALLBACK_LOGO}
                  className="platform-logo"
                />
              </a>
            ))}
          </div>
        ) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}
      </div>
      
      {isFetching ? null : displayDetails.rentalProviders?.length > 0 && (
        <div>
          <p className="font-semibold text-[var(--color-text-primary)] mb-2"><strong>{t.cardAvailableToRent}</strong></p>
          <div className="flex flex-wrap gap-2">
            {displayDetails.rentalProviders.map(p => (
              <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Rent on ${p.provider_name}`}>
                <SafeImage
                  src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`}
                  alt={p.provider_name}
                  fallback={FALLBACK_LOGO}
                  className="platform-logo"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <p className="font-semibold text-[var(--color-text-primary)] mb-2"><strong>{t.cardCast}</strong></p>
        {isFetching ? (
          <div className="flex gap-2"><span className="small-loader"></span></div>
        ) : displayDetails.cast?.length > 0 ? (
          <div className="horizontal-scroll-container">
            {displayDetails.cast.slice(0, 10).map(actor => (
              <button key={actor.id} onClick={() => handleActorClick(actor.id)} className="flex-shrink-0 w-20 text-center group hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded">
                <SafeImage
                  src={actor.profile_path ? `${TMDB_THUMBNAIL_BASE_URL}${actor.profile_path}` : FALLBACK_PROFILE}
                  alt={actor.name}
                  fallback={FALLBACK_PROFILE}
                  className="actor-thumbnail"
                />
                <p className="text-xs mt-1 text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-accent-text)]">{actor.name}</p>
              </button>
            ))}
          </div>
        ) : <span className="text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}
      </div>
    </div>
  );
});

const FilterModal = React.memo(({ isOpen, close, handleClearFilters, filters, handleGenreChangeInModal, genresMap, allPlatformOptions, platformSearchQuery, setPlatformSearchQuery, handlePlatformChange, t }) => {
  const filteredPlatforms = useMemo(() => 
    allPlatformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())),
    [allPlatformOptions, platformSearchQuery]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">{t.advancedFilters}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold mb-2 text-[var(--color-text-primary)]">{t.includeGenre}</p>
            <div className="filter-checkbox-list space-y-1">
              {Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5">
                  <input type="checkbox" checked={filters.genre.includes(id)} onChange={() => handleGenreChangeInModal(id, 'genre')} disabled={filters.excludeGenres.includes(id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50" />
                  <span className="text-sm text-[var(--color-text-primary)]">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2 text-[var(--color-text-primary)]">{t.excludeGenre}</p>
            <div className="filter-checkbox-list space-y-1">
              {Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5">
                  <input type="checkbox" checked={filters.excludeGenres.includes(id)} onChange={() => handleGenreChangeInModal(id, 'excludeGenres')} disabled={filters.genre.includes(id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50" />
                  <span className="text-sm text-[var(--color-text-primary)]">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold mb-2 text-[var(--color-text-primary)]">{t.platform}</p>
            <input type="text" value={platformSearchQuery} onChange={e => setPlatformSearchQuery(e.target.value)} placeholder={t.platformSearchPlaceholder} className="w-full p-2 mb-3 bg-[var(--color-bg)] border border-[var(--color-card-border)] rounded-md text-sm focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]" />
            <div className="filter-checkbox-list grid grid-cols-2 gap-1">
              {filteredPlatforms.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5">
                  <input type="checkbox" checked={filters.platform.includes(p.id)} onChange={() => handlePlatformChange(p.id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                  <span className="text-sm text-[var(--color-text-primary)]">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={() => { handleClearFilters(); close(); }} className="px-6 py-2 bg-slate-600 text-white font-bold rounded-lg shadow-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400">{t.clearFilters}</button>
          <button onClick={close} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">{t.applyFilters}</button>
        </div>
      </div>
    </div>
  );
});

const SkeletonMediaCard = React.memo(() => (
  <div className="w-full max-w-md mx-auto p-6 container-style animate-pulse">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-48 h-72 bg-slate-700 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
));

const SimilarMediaModal = React.memo(({ media, close, t, fetchFullMediaDetails, handleActorClick, userRegion, handleSimilarMediaClick, openTrailerModal }) => {
  const [details, setDetails] = useState(media);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!media) return;
    setIsFetching(true);
    setDetails({});
    fetchFullMediaDetails(media.id, media.mediaType)
      .then(d => { if (d) setDetails(d); })
      .finally(() => setIsFetching(false));
  }, [media?.id, media?.mediaType, fetchFullMediaDetails]);

  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={close} className="absolute top-4 right-4 p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {isFetching || !details.id ? (
          <div className="flex justify-center items-center h-64"><span className="loader"></span></div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <SafeImage
                src={details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : FALLBACK_POSTER}
                alt={`Poster for ${details.title || details.name}`}
                fallback={FALLBACK_POSTER}
                className="w-48 rounded-lg shadow-lg mx-auto sm:mx-0 flex-shrink-0"
              />
              <div className="flex flex-col items-center sm:items-start gap-4 w-full">
                {!isFetching && details.trailerKey && (
                  <button onClick={() => openTrailerModal(details.trailerKey)} className="w-full max-w-[300px] flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)]/20 text-[var(--color-accent-text)] font-bold rounded-lg shadow-md transition-colors hover:bg-[var(--color-accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
                    {t.cardTrailer}
                  </button>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{details.title || details.name}</h2>
              <p className="text-[var(--color-text-secondary)] mt-2">{details.overview}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">{t.details}</h3>
              <MediaCardContent media={media} details={details} isFetching={isFetching} t={t} userRegion={userRegion} handleActorClick={handleActorClick} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">{t.cardSimilarMovies}</h3>
              {isFetching ? (
                <div className="flex justify-center"><span className="small-loader"></span></div>
              ) : details.similar?.length > 0 ? (
                <div className="horizontal-scroll-container">
                  {details.similar.map(m => (
                    <button key={m.id} onClick={() => handleSimilarMediaClick(m)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded">
                      <SafeImage
                        src={m.poster ? `${TMDB_THUMBNAIL_BASE_URL}${m.poster}` : FALLBACK_POSTER}
                        alt={m.title}
                        fallback={FALLBACK_POSTER}
                        className="w-full rounded-lg shadow-md"
                      />
                      <p className="text-xs mt-1 text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-accent-text)]">{m.title}</p>
                    </button>
                  ))}
                </div>
              ) : <p className="text-[var(--color-text-secondary)]">{t.noMoviesFound}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const TrailerModal = React.memo(({ isOpen, close, trailerKey }) => {
  if (!isOpen || !trailerKey) return null;
  const youtubeSrc = `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={close}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button onClick={close} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="trailer-responsive">
          <iframe src={youtubeSrc} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
      </div>
    </div>
  );
});

const CookieConsentModal = React.memo(({ isOpen, onAccept, t }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto modal-content p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[var(--color-text-secondary)] flex-1">{t.cookieMessage}</p>
        <button onClick={onAccept} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
          {t.cookieAccept}
        </button>
      </div>
    </div>
  );
});