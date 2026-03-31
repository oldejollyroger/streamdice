// components.js

const FALLBACK_POSTER = 'https://placehold.co/300x450/1f2937/9ca3af?text=No+Image';
const FALLBACK_PROFILE = 'https://placehold.co/185x278/1f2937/9ca3af?text=No+Photo';

// Safe Image Component
const SafeImage = ({ src, alt, fallback, className, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
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
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

// Install PWA Components
const InstallPwaInstructions = ({ t }) => (
  <div className="install-button-wrapper">
    <p className="text-sm text-gray-400 text-center px-4">{t.installInstructions}</p>
  </div>
);

const InstallPwaButton = ({ t, handleInstallClick }) => (
  <div className="install-button-wrapper">
    <button onClick={handleInstallClick} className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
      {t.installApp}
    </button>
  </div>
);

// Settings Dropdown
const SettingsDropdown = ({ mode, setMode, accent, setAccent, language, setLanguage, tmdbLanguage, setTmdbLanguage, tmdbLanguages, t, openWatchedModal, openWatchlistModal, openRegionSelector }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px', color: '#e5e7eb' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', right: 0, marginTop: '0.5rem', width: '16rem', padding: '1rem', borderRadius: '0.75rem', backgroundColor: '#1f2937', border: '1px solid #374151', zIndex: 50 }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>{t.settings}</h3>
          
          {/* Accent Colors */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {ACCENT_COLORS.map(c => (
              <button key={c.name} onClick={() => setAccent(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.color, border: accent.name === c.name ? '2px solid white' : 'none', transform: accent.name === c.name ? 'scale(1.2)' : 'scale(1)' }} title={c.name}></button>
            ))}
          </div>
          
          {/* Theme Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={() => setMode('light')} style={{ padding: '0.5rem', borderRadius: '9999px', backgroundColor: mode === 'light' ? accent.color : 'transparent', color: mode === 'light' ? 'white' : '#9ca3af' }}>Light</button>
            <button onClick={() => setMode('dark')} style={{ padding: '0.5rem', borderRadius: '9999px', backgroundColor: mode === 'dark' ? accent.color : 'transparent', color: mode === 'dark' ? 'white' : '#9ca3af' }}>Dark</button>
          </div>
          
          {/* Language */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Site Language</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button onClick={() => { setLanguage('en'); setTmdbLanguage('en-US'); }} style={{ padding: '0.375rem', borderRadius: '9999px', backgroundColor: language === 'en' ? accent.color : 'rgba(0,0,0,0.2)', color: language === 'en' ? 'white' : '#9ca3af' }}>English</button>
<button onClick={() => { setLanguage('es'); setTmdbLanguage('es-ES'); }} style={{ padding: '0.375rem', borderRadius: '9999px', backgroundColor: language === 'es' ? accent.color : 'rgba(0,0,0,0.2)', color: language === 'es' ? 'white' : '#9ca3af' }}>Español</button>
           
           </div>
          </div>
          
          {/* Content Language */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t.contentLanguage}</label>
            <select value={tmdbLanguage} onChange={(e) => setTmdbLanguage(e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#fff', marginTop: '0.25rem' }}>
              {tmdbLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          
          {/* Menu Items */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '0.5rem' }}>
            <button onClick={() => { setIsOpen(false); openWatchlistModal(); }} style={{ width: '100%', padding: '0.5rem', textAlign: 'left', color: '#e5e7eb', backgroundColor: 'transparent', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>📑 {t.watchList}</button>
            <button onClick={() => { setIsOpen(false); openWatchedModal(); }} style={{ width: '100%', padding: '0.5rem', textAlign: 'left', color: '#e5e7eb', backgroundColor: 'transparent', borderRadius: '0.5rem', marginBottom: '0.25rem' }}>✓ {t.watchedList}</button>
            <button onClick={() => { setIsOpen(false); openRegionSelector(); }} style={{ width: '100%', padding: '0.5rem', textAlign: 'left', color: '#e5e7eb', backgroundColor: 'transparent', borderRadius: '0.5rem' }}>🌍 {t.changeCountry}</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Watched Media Modal
const WatchedMediaModal = ({ isOpen, close, watchedMedia, handleUnwatchMedia, mediaType, t }) => {
  if (!isOpen) return null;
  const watchedArray = Object.values(watchedMedia).filter(m => m.mediaType === mediaType);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={close}>
      <div style={{ width: '100%', maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderRadius: '1.25rem 1.25rem 0 0', overflow: 'hidden', animation: 'slideUp 0.90s cubic-bezier(0.32, 0.72, 0, 1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{t.watchedList}</h2>
            {watchedArray.length > 0 && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{watchedArray.length} title{watchedArray.length > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={close} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 }}>
          {watchedArray.length > 0 ? watchedArray.map(media => (
            <div key={media.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: '#1f2937', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
              <img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : FALLBACK_POSTER} alt="" style={{ width: '2.75rem', height: '4rem', objectFit: 'cover', borderRadius: '0.375rem', flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{media.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{media.year}</p>
              </div>
              <button onClick={() => handleUnwatchMedia(media.id)} style={{ flexShrink: 0, padding: '0.25rem 0.625rem', backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{t.unwatch}</button>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#4b5563' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎬</div>
              <p style={{ fontWeight: 600, color: '#6b7280' }}>No watched titles yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Mark titles as watched and they'll appear here</p>
            </div>
          )}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
          <button onClick={close} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))', color: '#fff', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', border: 'none' }}>Done</button>
        </div>
      </div>
    </div>
  );
};

// Watchlist Modal
const WatchlistModal = ({ isOpen, close, watchlist, handleToggleWatchlist, handleSimilarMediaClick, mediaType, t }) => {  if (!isOpen) return null;
  const watchlistArray = Object.values(watchlist).filter(m => m.mediaType === mediaType);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={close}>
      <div style={{ width: '100%', maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderRadius: '1.25rem 1.25rem 0 0', overflow: 'hidden', animation: 'slideUp 0.90s cubic-bezier(0.32, 0.72, 0, 1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{t.watchList}</h2>
            {watchlistArray.length > 0 && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{watchlistArray.length} title{watchlistArray.length > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={close} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 }}>
          {watchlistArray.length > 0 ? watchlistArray.map(media => (
<div key={media.id} onClick={() => handleSimilarMediaClick(media)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: '#1f2937', borderRadius: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>              <img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : FALLBACK_POSTER} alt="" style={{ width: '2.75rem', height: '4rem', objectFit: 'cover', borderRadius: '0.375rem', flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{media.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{media.year}</p>
              </div>
              <button onClick={() => handleToggleWatchlist(media)} style={{ flexShrink: 0, padding: '0.25rem 0.625rem', backgroundColor: 'rgba(75,85,99,0.4)', border: '1px solid #374151', color: '#9ca3af', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{t.removeFromList}</button>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#4b5563' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📑</div>
              <p style={{ fontWeight: 600, color: '#6b7280' }}>Your watchlist is empty</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Save titles to watch later and they'll appear here</p>
            </div>
          )}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
          <button onClick={close} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))', color: '#fff', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', border: 'none' }}>Done</button>
        </div>
      </div>
    </div>
  );
};

// Actor Details Modal
const ActorDetailsModal = ({ isOpen, close, actorDetails, isFetching, t }) => {
  if (!isOpen) return null;
  
  const popularMedia = React.useMemo(() => {
    if (!actorDetails) return [];
    
    // FIXED: Even stricter filtering to remove talk shows and low-quality content
    const allMedia = (actorDetails?.movie_credits?.cast || [])
      .concat(actorDetails?.tv_credits?.cast || [])
      .filter(m => {
        if (!m.poster_path) return false;
        
        // Stricter vote requirements
        if (m.vote_count < 150) return false;
        if (m.vote_average < 6.5) return false;
        
        // Filter out talk shows, news, and daily shows by episode count
        if (m.media_type === 'tv' || m.first_air_date) {
          // Exclude shows with too many episodes (talk shows, daily shows)
          if (m.episode_count && m.episode_count > 500) return false;
          // Exclude ongoing shows that are too long-running (talk shows)
          if (m.number_of_episodes && m.number_of_episodes > 500) return false;
        }
        
        return true;
      })
      .map((m) => {
        // Calculate relevance score with movie preference
        const popularityScore = m.popularity * 0.3;
        const ratingScore = m.vote_average * 15;
        const voteCountScore = Math.min(m.vote_count / 5, 200);
        
        // Strong bonus for lead roles
        const orderBonus = m.order < 3 ? 100 : m.order < 5 ? 50 : 0;
        
        // Prefer movies over TV shows
        const mediaTypeBonus = (m.media_type === 'movie' || m.release_date) ? 50 : 0;
        
        // Bonus for recent releases (last 20 years)
        const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : 
                           m.first_air_date ? new Date(m.first_air_date).getFullYear() : 1900;
        const recencyBonus = releaseYear >= 2005 ? 30 : releaseYear >= 1990 ? 10 : 0;
        
        return {
          ...m,
          relevanceScore: popularityScore + ratingScore + voteCountScore + orderBonus + mediaTypeBonus + recencyBonus
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12);
    
    return allMedia;
  }, [actorDetails]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={close}>
      <div style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '1rem', padding: '1.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
<button onClick={(e) => { e.stopPropagation(); close(); }} onTouchEnd={(e) => { e.stopPropagation(); close(); }} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.target.style.color = '#fff'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#9ca3af'; }}>✕</button>
        
        {isFetching || !actorDetails ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="loader"></span></div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <img src={actorDetails.profile_path ? `${TMDB_IMAGE_BASE_URL}${actorDetails.profile_path}` : FALLBACK_PROFILE} alt="" style={{ width: '8rem', height: '12rem', objectFit: 'cover', borderRadius: '0.5rem' }} />
              <div style={{ flex: 1, paddingRight: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{actorDetails.name}</h2>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>{actorDetails.biography?.substring(0, 300) || 'No biography available.'}{actorDetails.biography?.length > 300 ? '...' : ''}</p>
              </div>
            </div>
            <h3 style={{ fontWeight: '600', color: '#fff', marginBottom: '0.5rem' }}>Known For</h3>
            {popularMedia.length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {popularMedia.map(m => (
                  <div key={m.id} style={{ flexShrink: 0, width: '6rem', textAlign: 'center' }}>
                    <img src={`${TMDB_THUMBNAIL_BASE_URL}${m.poster_path}`} alt="" style={{ width: '100%', borderRadius: '0.25rem' }} />
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{m.title || m.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '1rem 0' }}>No notable works found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
// Media Card Content
const MediaCardContent = ({ media, details, isFetching, t, userRegion, handleActorClick }) => {
  const displayDetails = isFetching ? {} : details;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
      <p style={{ color: '#e5e7eb' }}><strong style={{ color: '#9ca3af' }}>{t.cardYear}:</strong> {media.year}</p>
      {displayDetails.duration && <p style={{ color: '#e5e7eb' }}><strong style={{ color: '#9ca3af' }}>{t.cardDuration}:</strong> {formatDuration(displayDetails.duration)}</p>}
      {displayDetails.seasons && <p style={{ color: '#e5e7eb' }}><strong style={{ color: '#9ca3af' }}>{t.cardSeasons}:</strong> {displayDetails.seasons}</p>}
      <p style={{ color: '#e5e7eb' }}><strong style={{ color: '#9ca3af' }}>{t.cardRating}:</strong> {media.imdbRating}/10 ⭐</p>
{media.genres?.length > 0 && <p style={{ color: '#e5e7eb' }}><strong style={{ color: '#9ca3af' }}>{t.cardGenres}:</strong> {media.genres.join(', ')}</p>}      
      {displayDetails.providers?.length > 0 && (
        <div>
          <p style={{ fontWeight: '600', color: '#fff', marginBottom: '0.5rem' }}>{t.cardAvailableOn} {userRegion}:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {displayDetails.providers.map(p => (
              <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer">
                <img src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} style={{ width: '40px', height: '40px', borderRadius: '0.5rem' }} />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {displayDetails.cast?.length > 0 && (
  <div>
    <p style={{ fontWeight: '600', color: '#fff', marginBottom: '0.5rem' }}>{t.cardCast}:</p>
    <div 
      onTouchStart={(e) => e.stopPropagation()} 
      onTouchMove={(e) => e.stopPropagation()} 
      onTouchEnd={(e) => e.stopPropagation()}
      style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
            {displayDetails.cast.slice(0, 10).map(actor => (
              <button key={actor.id} onClick={() => handleActorClick(actor.id)} style={{ flexShrink: 0, width: '5rem', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                <img src={actor.profile_path ? `${TMDB_THUMBNAIL_BASE_URL}${actor.profile_path}` : FALLBACK_PROFILE} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '0.25rem' }} />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{actor.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Filter Modal
const FilterModal = ({ isOpen, close, handleClearFilters, filters, handleGenreChangeInModal, genresMap, allPlatformOptions, platformSearchQuery, setPlatformSearchQuery, handlePlatformChange, t }) => {
  if (!isOpen) return null;
  const filteredPlatforms = allPlatformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase()));
  const activeCount = (filters.genre?.length || 0) + (filters.excludeGenres?.length || 0) + (filters.platform?.length || 0);
  const pillBase = { display: 'inline-flex', alignItems: 'center', padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid', marginRight: '0.5rem', marginBottom: '0.5rem', userSelect: 'none' };
  const pillActive = { ...pillBase, background: 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))', borderColor: 'transparent', color: '#fff' };
  const pillExclude = { ...pillBase, backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.5)', color: '#fca5a5' };
  const pillInactive = { ...pillBase, backgroundColor: 'transparent', borderColor: '#374151', color: '#9ca3af' };
  const sectionTitleStyle = { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={close}>
<div style={{ width: '100%', maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderRadius: '1.25rem 1.25rem 0 0', overflow: 'hidden', animation: 'slideUp 0.90s cubic-bezier(0.32, 0.72, 0, 1)' }} onClick={e => e.stopPropagation()}>        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{t.advancedFilters}</h2>
            {activeCount > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{activeCount} active filter{activeCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={close} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionTitleStyle}>{t.includeGenre}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (
                <span key={id} style={filters.genre.includes(id) ? pillActive : pillInactive} onClick={() => handleGenreChangeInModal(id, 'genre')}>{name}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionTitleStyle}>{t.excludeGenre}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (
                <span key={id} style={filters.excludeGenres.includes(id) ? pillExclude : pillInactive} onClick={() => handleGenreChangeInModal(id, 'excludeGenres')}>{name}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionTitleStyle}>{t.platform}</p>
            <input type="text" value={platformSearchQuery} onChange={e => setPlatformSearchQuery(e.target.value)} placeholder={t.platformSearchPlaceholder} style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.625rem', color: '#e5e7eb', fontSize: '0.875rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {filteredPlatforms.map(p => (
                <span key={p.id} style={filters.platform.includes(p.id) ? pillActive : pillInactive} onClick={() => handlePlatformChange(p.id)}>{p.name}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1f2937', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
          <button onClick={() => { handleClearFilters(); close(); }} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>{t.clearFilters}</button>
          <button onClick={close} style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))', color: '#fff', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', border: 'none' }}>{t.applyFilters}</button>
        </div>
      </div>
    </div>
  );
};

// Trailer Modal
const TrailerModal = ({ isOpen, close, trailerKey }) => {
  if (!isOpen || !trailerKey) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.9)' }} onClick={close}>
      <div style={{ width: '100%', maxWidth: '56rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={close} style={{ position: 'absolute', top: '-3rem', right: '0', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '0.75rem', overflow: 'hidden' }}>
          <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}></iframe>
        </div>
      </div>
    </div>
  );
};

// Similar Media Modal
const SimilarMediaModal = ({ media, close, fetchFullMediaDetails, handleActorClick, handleSimilarMediaClick, t, userRegion, openTrailerModal }) => {
  if (!media) return null;
  const [details, setDetails] = React.useState({});
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    setIsFetching(true);
    fetchFullMediaDetails(media.id, media.mediaType).then(d => {
      if (d) setDetails(d);
      setIsFetching(false);
    });
  }, [media.id, media.mediaType, fetchFullMediaDetails]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={close}>
  <div style={{ width: '100%', maxWidth: '42rem', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '1rem', padding: '1.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
    <button onClick={close} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.target.style.color = '#fff'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#9ca3af'; }}>✕</button>
    {isFetching ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="loader"></span></div>
    ) : (
      <>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <img src={details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : FALLBACK_POSTER} alt="" style={{ width: '12rem', borderRadius: '0.5rem' }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{details.title || details.name}</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>{details.overview}</p>
            {details.trailerKey && (
              <button onClick={() => openTrailerModal(details.trailerKey)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(168,85,247,0.2)', color: '#d8b4fe', borderRadius: '0.5rem', fontWeight: 'bold' }}>▶ Watch Trailer</button>
            )}
          </div>
        </div>
        <MediaCardContent media={media} details={details} isFetching={isFetching} t={t} userRegion={userRegion} handleActorClick={handleActorClick} />
      </>
    )}
  </div>
</div>
  );
};

// Cookie Consent Modal
const CookieConsentModal = ({ isOpen, onAccept, t }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '1rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', flex: 1 }}>{t.cookieMessage}</p>
        <button onClick={onAccept} style={{ padding: '0.5rem 1.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', borderRadius: '9999px', fontWeight: 'bold' }}>{t.cookieAccept}</button>
      </div>
    </div>
  );
};

// Skeleton Card
const SkeletonMediaCard = () => (
  <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto', padding: '1.5rem', backgroundColor: '#1f2937', borderRadius: '1rem' }}>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ width: '12rem', height: '18rem', backgroundColor: '#374151', borderRadius: '0.5rem' }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ height: '2rem', backgroundColor: '#374151', borderRadius: '0.25rem', marginBottom: '1rem', width: '75%' }}></div>
        <div style={{ height: '1rem', backgroundColor: '#374151', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '1rem', backgroundColor: '#374151', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '1rem', backgroundColor: '#374151', borderRadius: '0.25rem', width: '50%' }}></div>
      </div>
    </div>
  </div>
);