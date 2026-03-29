// app.js - Complete Version with UX Polish

const App = () => {
  const { useState, useEffect, useCallback, useMemo, useRef } = React;

  // Get toast function
  const { addToast } = useToast();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [mode, setMode] = useLocalStorageState('movieRandomizerMode', 'dark');
  const [accent, setAccent] = useLocalStorageState('movieRandomizerAccent', ACCENT_COLORS[0]);
  const [language, setLanguage] = useLocalStorageState('movieRandomizerLang', 'en');
  const [tmdbLanguage, setTmdbLanguage] = useLocalStorageState('tmdbContentLang', 'en-US');
  const [userRegion, setUserRegion] = useLocalStorageState('movieRandomizerRegion', null);
  const [mediaType, setMediaType] = useLocalStorageState('mediaPickerType_v1', 'movie');
  const [showRegionSelector, setShowRegionSelector] = useState(() => {
    try {
      return !localStorage.getItem('movieRandomizerRegion');
    } catch (e) {
      return true;
    }
  });

  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0, actor: null, creator: null, duration: 0, ageRating: 0 };
  const [filters, setFilters] = useLocalStorageState('mediaPickerFilters_v4', initialFilters);
  const [cookieConsent, setCookieConsent] = useLocalStorageState('cookieConsent_v1', false);

const WATCHED_KEY = 'mediaPickerWatched_v2';
const WATCHLIST_KEY = 'mediaPickerWatchlist_v2';
const RECENT_HISTORY_KEY = 'mediaPickerRecentHistory_v1';
const [watchedMedia, setWatchedMedia] = useLocalStorageState(WATCHED_KEY, {});
const [watchList, setWatchList] = useLocalStorageState(WATCHLIST_KEY, {});
const [recentlyShownIds, setRecentlyShownIds] = useLocalStorageState(RECENT_HISTORY_KEY, []);

  const [allMedia, setAllMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaHistory, setMediaHistory] = useState([]);
  const [mediaDetails, setMediaDetails] = useState({});
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

  // UX State
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false); 

  const t = translations[language];
  const searchRef = useRef(null);

  // ============================================
  // MEMOIZED VALUES
  // ============================================
  const durationOptions = useMemo(() => [
    { label: t.any, gte: 0, lte: 999 },
    { label: "< 90 min", gte: 0, lte: 90 },
    { label: "90-120 min", gte: 90, lte: 120 },
    { label: "> 120 min", gte: 120, lte: 999 }
  ], [t]);

  const ageRatingOptions = useMemo(() => {
    const ratings = userRegion === 'US' ? ['G', 'PG', 'PG-13', 'R', 'NC-17'] : ['U', 'PG', '12', '15', '18'];
    return [t.any, ...ratings];
  }, [userRegion, t]);

  const quickFilterGenres = useMemo(() => {
    if (mediaType === 'movie') return [{ id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '53', name: 'Thriller' }];
    return [{ id: '10759', name: 'Action & Adventure' }, { id: '35', name: 'Comedy' }, { id: '10765', name: 'Sci-Fi & Fantasy' }, { id: '80', name: 'Crime' }];
  }, [mediaType]);

  const tmdbLanguages = [
    { code: 'en-US', name: 'English' }, { code: 'es-ES', name: 'Español' }, { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' }, { code: 'it-IT', name: 'Italiano' }, { code: 'pt-PT', name: 'Português' },
    { code: 'ru-RU', name: 'Русский' }, { code: 'ja-JP', name: '日本語' }, { code: 'ko-KR', name: '한국어' }, { code: 'zh-CN', name: '中文' }
  ];

  const showInstallButton = installPrompt && !isIos && !isStandalone;
  const showIosInstallInstructions = isIos && !isStandalone;
  const isCurrentMediaWatched = selectedMedia && watchedMedia[selectedMedia.id];

 // FIXED: Swapped callbacks to match corrected swipe logic
// Also REMOVED swipeUp to prevent accidental watchlist additions
const swipeHandlers = useSwipeGesture(
  () => { if (!isDiscovering && userRegion) handleSurpriseMe(); }, // Swipe LEFT = Next
  () => { if (mediaHistory.length > 0) handleGoBack(); }, // Swipe RIGHT = Back
  null, // Swipe UP = Disabled (was causing accidental watchlist adds)
  { enabled: !!selectedMedia && !isDiscovering && !isTrailerModalOpen && !isFilterModalOpen }
);

  // ============================================
  // API FUNCTIONS
  // ============================================
  const fetchApi = useCallback(async (path, query) => {
    if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) {
      throw new Error("API Key is missing.");
    }
    const params = new URLSearchParams(query);
    const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.status_message || `API error: ${response.status}`);
    }
    return response.json();
  }, []);

  const resetAllState = useCallback(() => {
    setAllMedia([]);
    setSelectedMedia(null);
    setHasSearched(false);
    setMediaHistory([]);
  }, []);

const resetAndClearFilters = () => {
  resetAllState();
  setFilters(initialFilters);
  // Clear recent history when filters are cleared
  setRecentlyShownIds([]);
};

// Track recently shown media to prevent duplicates
const addToRecentHistory = useCallback((mediaId) => {
  setRecentlyShownIds(prev => {
    const updated = [mediaId, ...prev.filter(id => id !== mediaId)];
    return updated.slice(0, 100); // Keep last 100
  });
}, [setRecentlyShownIds]);
  

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const doc = document.documentElement;
    doc.classList.remove('light-mode', 'dark-mode');
    doc.classList.add(`${mode}-mode`);
  }, [mode]);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--color-accent', accent.color);
    r.style.setProperty('--color-accent-text', accent.text);
    r.style.setProperty('--color-accent-gradient-from', accent.from);
    r.style.setProperty('--color-accent-gradient-to', accent.to);
  }, [accent]);

  useEffect(() => { resetAllState(); }, [language, tmdbLanguage]);

  useEffect(() => {
    const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(i);
    if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true);
    const p = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', p);
    return () => window.removeEventListener('beforeinstallprompt', p);
  }, []);

  // Show swipe hint on mobile
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
    if (isMobile && !hasSeenHint && selectedMedia) {
      setTimeout(() => setShowSwipeHint(true), 2000);
      localStorage.setItem('hasSeenSwipeHint', 'true');
    }
  }, [selectedMedia]);

  // Modal close on Escape
  const closeModal = useCallback(() => {
    setIsTrailerModalOpen(false);
    setModalTrailerKey(null);
    setIsActorModalOpen(false);
    setModalMedia(null);
    setIsWatchedModalOpen(false);
    setIsWatchlistModalOpen(false);
    setIsFilterModalOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  // Bootstrap app
  useEffect(() => {
    const bootstrapApp = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const regionsData = await fetchApi('configuration/countries', {});
        setAvailableRegions(regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a, b) => a.english_name.localeCompare(b.english_name)));
      } catch (err) {
        console.error("Error bootstrapping:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapApp();
  }, [fetchApi]);

  // Fetch genres
  useEffect(() => {
    const fetchLanguageData = async () => {
      if (!tmdbLanguage) return;
      try {
        const d = await fetchApi(`genre/${mediaType}/list`, { language: tmdbLanguage });
        setGenresMap(d.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {}));
      } catch (e) {
        console.error("Error fetching genres:", e);
      }
    };
    fetchLanguageData();
  }, [tmdbLanguage, mediaType, fetchApi]);

  // Fetch platforms
  useEffect(() => {
    if (!userRegion) return;
    const fetchPlatforms = async () => {
      try {
        const data = await fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion });
        const sorted = data.results.sort((a, b) => (a.display_priorities?.[userRegion] ?? 100) - (b.display_priorities?.[userRegion] ?? 100));
        setQuickPlatformOptions(sorted.slice(0, 6).map(p => ({ id: p.provider_id.toString(), name: p.provider_name })));
        setAllPlatformOptions(sorted.map(p => ({ id: p.provider_id.toString(), name: p.provider_name })));
      } catch (err) {
        console.error("Error fetching providers", err);
      }
    };
    fetchPlatforms();
  }, [userRegion, mediaType, fetchApi]);

  // Search
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedSearchQuery, tmdbLanguage, genresMap, fetchApi]);

  // Fetch media details
  const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
    if (!mediaId || !type) return null;
    try {
      const append = type === 'movie'
        ? 'credits,videos,watch/providers,similar,recommendations,release_dates'
        : 'credits,videos,watch/providers,similar,recommendations,content_ratings';
      const data = await fetchApi(`${type}/${mediaId}`, { language: tmdbLanguage, append_to_response: append });

      let certification = '';
      if (type === 'movie') {
        const rel = data.release_dates?.results?.find(r => r.iso_3166_1 === userRegion);
        certification = rel?.release_dates.find(rd => rd.certification)?.certification || '';
      } else {
        const rat = data.content_ratings?.results?.find(r => r.iso_3166_1 === userRegion);
        certification = rat?.rating || '';
      }

      const director = data.credits?.crew?.find(p => p.job === 'Director');
      const similarMedia = [...(data.recommendations?.results || []), ...(data.similar?.results || [])]
        .filter((v, i, a) => v.poster_path && a.findIndex(t => t.id === v.id) === i)
        .map(r => normalizeMediaData(r, type, genresMap))
        .filter(Boolean)
        .slice(0, 10);

      const regionData = data['watch/providers']?.results?.[userRegion];
      const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`;
      const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
      const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
      const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
      const uniquePayProviders = [...rentProviders, ...buyProviders].filter((p, i, a) => a.findIndex(x => x.provider_id === p.provider_id) === i);

      return {
        ...data,
        duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
        providers,
        rentalProviders: uniquePayProviders,
        cast: data.credits?.cast?.slice(0, 10) || [],
        director,
        seasons: data.number_of_seasons,
        trailerKey: data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
        similar: similarMedia,
        certification
      };
    } catch (err) {
      console.error(`Error fetching details:`, err);
      return null;
    }
  }, [userRegion, tmdbLanguage, genresMap, fetchApi]);

  useEffect(() => {
    if (!selectedMedia) return;
    setIsFetchingDetails(true);
    setMediaDetails({});
    fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => {
      if (details) setMediaDetails(details);
      setIsFetchingDetails(false);
    });
  }, [selectedMedia, fetchFullMediaDetails]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
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
      if (filters.ageRating > 0) {
        ageRatingParams.certification_country = userRegion;
        ageRatingParams.certification = ageRatingOptions.slice(1, filters.ageRating + 1).join('|');
      }

      const queryParams = {
        language: tmdbLanguage,
        'vote_count.gte': mediaType === 'movie' ? 200 : 100,
        watch_region: userRegion,
        ...(filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') }),
        ...(filters.genre.length > 0 && { with_genres: filters.genre.join(',') }),
        ...(filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }),
        ...(filters.minRating > 0 && { 'vote_average.gte': filters.minRating }),
        ...(filters.decade !== 'todos' && {
          [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`,
          [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31`
        }),
        ...(filters.actor && { with_cast: filters.actor.id }),
        ...(filters.creator && { with_crew: filters.creator.id }),
        ...(filters.duration > 0 && { [`${runtimeParam}.gte`]: selectedDuration.gte, [`${runtimeParam}.lte`]: selectedDuration.lte }),
        ...ageRatingParams,
        sort_by: 'popularity.desc'
      };

      const initialData = await fetchApi(`discover/${mediaType}`, queryParams);
      const totalPages = Math.min(initialData.total_pages, 200);

      if (totalPages === 0) {
        setAllMedia([]);
        setSelectedMedia(null);
        setIsDiscovering(false);
        addToast(t.noMoviesFound, 'info');
        return;
      }

     const randomPage = Math.floor(Math.pow(Math.random(), 2) * (totalPages - 1)) + 1;
const data = randomPage === 1 ? initialData : await fetchApi(`discover/${mediaType}`, { ...queryParams, page: randomPage });
const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);

// FIXED: Exclude both watched AND recently shown movies to prevent duplicates
const unwatchedMedia = transformedMedia.filter(m => 
  !watchedMedia[m.id] && !recentlyShownIds.includes(m.id)
);

setAllMedia(unwatchedMedia);

if (unwatchedMedia.length > 0) {
  const selected = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)];
  setSelectedMedia(selected);
  addToRecentHistory(selected.id);
  setShowSparkles(true);  
  setTimeout(() => setShowSparkles(false), 1500);
} else {
  setSelectedMedia(null);
  addToast(t.noMoviesFound, 'info');
}

      setAllMedia(unwatchedMedia);

      if (unwatchedMedia.length > 0) {
        setSelectedMedia(unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]);
      } else {
        setSelectedMedia(null);
        addToast(t.noMoviesFound, 'info');
      }
    } catch (err) {
      console.error("Error discovering:", err);
      setError(err.message);
    } finally {
      setIsDiscovering(false);
    }
}, [filters, tmdbLanguage, mediaType, userRegion, genresMap, watchedMedia, recentlyShownIds, selectedMedia, fetchApi, durationOptions, ageRatingOptions, addToast, addToRecentHistory, t]);

  const handleRegionChange = (newRegion) => {
    setUserRegion(newRegion);
    resetAllState();
    setFilters(initialFilters);
    setShowRegionSelector(false);
    addToast(`Region set to ${newRegion}`, 'success');
  };

  const handleMediaTypeChange = (type) => {
    if (type === mediaType) return;
    resetAllState();
    setFilters(initialFilters);
    setMediaType(type);
  };

  const handleFilterChange = (type, value) => {
    setFilters(f => ({ ...f, [type]: value }));
  };

 const handleQuickFilterToggle = (list, id) => {
  setFilters(f => {
    const current = [...(f[list] || [])];
    const index = current.indexOf(id);
    if (index > -1) current.splice(index, 1);
    else current.push(id);
    return { ...f, [list]: current };
  });
  resetAllState();
  // Clear recent history when filters change to allow fresh results
  setRecentlyShownIds([]);
};
  const handleGenreChangeInModal = (genreId, type) => {
    setFilters(f => {
      const list = [...(f[type] || [])];
      const otherType = type === 'genre' ? 'excludeGenres' : 'genre';
      const otherList = [...(f[otherType] || [])];
      const index = list.indexOf(genreId);
      if (index > -1) list.splice(index, 1);
      else {
        list.push(genreId);
        const otherIndex = otherList.indexOf(genreId);
        if (otherIndex > -1) otherList.splice(otherIndex, 1);
      }
      return { ...f, [type]: list, [otherType]: otherList };
    });
  };

  const handlePlatformChange = (id) => {
    setFilters(f => {
      const current = [...(f.platform || [])];
      const index = current.indexOf(id);
      if (index > -1) current.splice(index, 1);
      else current.push(id);
      return { ...f, platform: current };
    });
  };

  const handleMarkAsWatched = (media) => {
    const newWatched = { ...watchedMedia };
    if (newWatched[media.id]) {
      delete newWatched[media.id];
      addToast(t.toastUnwatched || 'Removed from watched', 'info');
    } else {
      newWatched[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year };
      addToast(t.toastWatched || 'Marked as watched!', 'watched');
      const newCount = Object.keys(newWatched).length;
      if (newCount > 0 && newCount % 10 === 0) setShowConfetti(true);
    }
    setWatchedMedia(newWatched);
  };

  const handleUnwatchMedia = (mediaId) => {
    const newWatched = { ...watchedMedia };
    delete newWatched[mediaId];
    setWatchedMedia(newWatched);
    addToast(t.toastUnwatched || 'Removed from watched', 'info');
  };

  const handleToggleWatchlist = (media) => {
    const newWatchlist = { ...watchList };
    if (newWatchlist[media.id]) {
      delete newWatchlist[media.id];
      addToast(t.toastRemovedFromWatchlist || 'Removed from watchlist', 'info');
    } else {
      newWatchlist[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year };
      addToast(t.toastAddedToWatchlist || 'Added to watchlist!', 'watchlist');
    }
    setWatchList(newWatchlist);
  };

  const handleGoBack = () => {
    if (mediaHistory.length === 0) return;
    const newHistory = [...mediaHistory];
    const prev = newHistory.pop();
    setMediaHistory(newHistory);
    setSelectedMedia(prev);
  };

  const handleShare = useCallback(() => {
    if (!selectedMedia) return;
    const url = `https://www.themoviedb.org/${selectedMedia.mediaType}/${selectedMedia.id}`;
    if (navigator.share) {
      navigator.share({ title: selectedMedia.title, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => addToast(t.shareSuccess || 'Link copied!', 'success'));
    }
  }, [selectedMedia, addToast, t]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const handleActorClick = async (actorId) => {
    closeModal();
    setIsActorModalOpen(true);
    setIsFetchingActorDetails(true);
    fetchApi(`person/${actorId}`, { append_to_response: 'movie_credits,tv_credits' })
      .then(setActorDetails)
      .catch(console.error)
      .finally(() => setIsFetchingActorDetails(false));
  };

  const handleSimilarMediaClick = (media) => {
    setModalMedia(media);
  };

  const handleSearchResultClick = (result) => {
  if (result.resultType === 'person') {
    const isCreator = result.year === 'Directing' || result.year === 'Writing' || result.year === 'Production';
    setFilters(f => ({ ...f, actor: isCreator ? null : result, creator: isCreator ? result : null }));
    resetAllState();
  } else {
    if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
    setSelectedMedia(result);
    addToRecentHistory(result.id);
  }
  setSearchQuery('');
  setSearchResults([]);
};

  const openTrailerModal = (key) => {
    setModalTrailerKey(key);
    setIsTrailerModalOpen(true);
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span className="loader"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
        <p style={{ color: '#ef4444', fontSize: '1.25rem', textAlign: 'center' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', maxWidth: '72rem', margin: '0 auto' }} {...swipeHandlers}>
      {/* Confetti */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <Sparkles active={showSparkles} />
      
      {/* Swipe Hint */}
      <SwipeHint show={showSwipeHint} onDismiss={() => setShowSwipeHint(false)} />

      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StreamDice</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t.subtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Media Type Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.25rem' }}>
            <button onClick={() => handleMediaTypeChange('movie')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: mediaType === 'movie' ? 'linear-gradient(to right, var(--color-accent-gradient-from), var(--color-accent-gradient-to))' : 'transparent', background: mediaType === 'movie' ? 'linear-gradient(to right, #a855f7, #ec4899)' : 'transparent', color: mediaType === 'movie' ? 'white' : '#9ca3af', border: 'none', cursor: 'pointer' }}>{t.movies}</button>
            <button onClick={() => handleMediaTypeChange('tv')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: mediaType === 'tv' ? 'linear-gradient(to right, #a855f7, #ec4899)' : 'transparent', color: mediaType === 'tv' ? 'white' : '#9ca3af', border: 'none', cursor: 'pointer' }}>{t.tvShows}</button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }} ref={searchRef}>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} style={{ width: '10rem', padding: '0.5rem 0.5rem 0.5rem 2.25rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', fontSize: '0.875rem', color: '#e5e7eb' }} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" style={{ width: '1rem', height: '1rem', position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', right: 0, width: '18rem', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem', zIndex: 50, overflow: 'hidden' }}>
                {searchResults.map(result => (
                  <button key={`${result.resultType}-${result.id}`} onClick={() => handleSearchResultClick(result)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <img src={result.poster ? `${TMDB_THUMBNAIL_BASE_URL}${result.poster}` : 'https://placehold.co/40x60/1f2937/9ca3af?text=?'} alt="" style={{ width: '2.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '0.25rem' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{result.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <SettingsDropdown mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} language={language} setLanguage={setLanguage} tmdbLanguage={tmdbLanguage} setTmdbLanguage={setTmdbLanguage} tmdbLanguages={tmdbLanguages} t={t} openWatchedModal={() => setIsWatchedModalOpen(true)} openWatchlistModal={() => setIsWatchlistModalOpen(true)} openRegionSelector={() => setShowRegionSelector(true)} />
        </div>
      </header>

      {/* Install PWA */}
      {showInstallButton && <InstallPwaButton t={t} handleInstallClick={handleInstallClick} />}
      {showIosInstallInstructions && <InstallPwaInstructions t={t} />}

      {/* Quick Genre Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {quickFilterGenres.map(genre => (
          <button key={genre.id} onClick={() => handleQuickFilterToggle('genre', genre.id)} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid', borderColor: filters.genre.includes(genre.id) ? 'transparent' : 'rgba(255,255,255,0.2)', background: filters.genre.includes(genre.id) ? 'linear-gradient(to right, #a855f7, #ec4899)' : 'transparent', color: filters.genre.includes(genre.id) ? 'white' : '#9ca3af', cursor: 'pointer' }}>{genre.name}</button>
        ))}
      </div>

      {/* Quick Platform Filters */}
      {userRegion && quickPlatformOptions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {quickPlatformOptions.map(p => (
            <button key={p.id} onClick={() => handleQuickFilterToggle('platform', p.id)} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid', borderColor: filters.platform.includes(p.id) ? 'transparent' : 'rgba(255,255,255,0.2)', background: filters.platform.includes(p.id) ? 'linear-gradient(to right, #a855f7, #ec4899)' : 'transparent', color: filters.platform.includes(p.id) ? 'white' : '#9ca3af', cursor: 'pointer' }}>{p.name}</button>
          ))}
        </div>
      )}

      {/* Advanced Filters Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{t.decade}</label>
          <select value={filters.decade} onChange={(e) => handleFilterChange('decade', e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#e5e7eb' }}>
            <option value="todos">{t.allDecades}</option>
            {[2020, 2010, 2000, 1990, 1980, 1970].map(d => <option key={d} value={d}>{d}s</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{t.minRating}: {Number(filters.minRating).toFixed(1)}</label>
          <input type="range" min="0" max="9" step="0.5" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{t.duration}: {durationOptions[filters.duration].label}</label>
          <input type="range" min="0" max="3" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{t.ageRating}: {ageRatingOptions[filters.ageRating]}</label>
          <input type="range" min="0" max={ageRatingOptions.length - 1} value={filters.ageRating} onChange={(e) => handleFilterChange('ageRating', e.target.value)} style={{ width: '100%' }} />
        </div>
        <button onClick={() => setIsFilterModalOpen(true)} style={{ padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#e5e7eb', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          {t.showFilters}
        </button>
      </div>

      {/* Surprise Me Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button onClick={handleSurpriseMe} disabled={isDiscovering || !userRegion} style={{ padding: '0.75rem 2rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', fontWeight: 'bold', borderRadius: '9999px', fontSize: '1.125rem', border: 'none', cursor: isDiscovering || !userRegion ? 'not-allowed' : 'pointer', opacity: isDiscovering || !userRegion ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isDiscovering ? <><span className="small-loader" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></span> {t.searching}</> : <><span>🎲</span> {t.surpriseMe}</>}
        </button>
      </div>

      {/* Active Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {filters.actor && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
            {filters.actor.title}
            <button onClick={() => { setFilters(f => ({ ...f, actor: null })); resetAllState(); }} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', color: 'white' }}>✕</button>
          </span>
        )}
        {filters.platform.map(id => {
          const platform = allPlatformOptions.find(p => p.id === id);
          return platform && (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
              {platform.name}
              <button onClick={() => handleQuickFilterToggle('platform', id)} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', color: 'white' }}>✕</button>
            </span>
          );
        })}
        {filters.genre.map(id => genresMap[id] && (
          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>
            {genresMap[id]}
            <button onClick={() => handleQuickFilterToggle('genre', id)} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', color: 'white' }}>✕</button>
          </span>
        ))}
      </div>

      {/* Main Content */}
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isDiscovering ? (
          <DiceRollAnimation isRolling={true} />
        ) : selectedMedia ? (
  <div className="movie-card-animated" style={{ width: '100%', maxWidth: '56rem', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '1rem', padding: '1.5rem' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Poster */}
        <div className="movie-poster-animated" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img src={selectedMedia.poster ? `${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}` : 'https://placehold.co/300x450/1f2937/9ca3af?text=No+Poster'} alt="" style={{ width: '14rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} />
          {!isFetchingDetails && mediaDetails.trailerKey && (
            <button onClick={() => openTrailerModal(mediaDetails.trailerKey)} style={{ width: '100%', maxWidth: '14rem', padding: '0.75rem', backgroundColor: 'rgba(168,85,247,0.2)', color: '#d8b4fe', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>▶ {t.cardTrailer}</button>
          )}
        </div>

        {/* Details */}
        <div className="movie-details-animated" style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>{selectedMedia.title}</h2>
          <p style={{ color: '#9ca3af', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selectedMedia.synopsis}</p>

          {/* Action Buttons */}
          <div className="movie-actions-animated" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <button onClick={() => handleMarkAsWatched(selectedMedia)} style={{ flex: 1, minWidth: '140px', padding: '0.75rem', backgroundColor: isCurrentMediaWatched ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {isCurrentMediaWatched ? '✓ ' + t.cardIsWatched : t.cardMarkAsWatched}
            </button>
            <button onClick={() => handleToggleWatchlist(selectedMedia)} style={{ flex: 1, minWidth: '140px', padding: '0.75rem', backgroundColor: 'rgba(14,165,233,0.8)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {watchList[selectedMedia.id] ? '★' : '☆'} {t.saveForLater}
            </button>
            <button onClick={handleShare} style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(75,85,99,0.8)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>↗ {t.shareButton}</button>
          </div>

          {/* Media Card Content */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem' }}>
            <MediaCardContent media={selectedMedia} details={mediaDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} handleActorClick={handleActorClick} />
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem' }}>
        <h3 style={{ fontWeight: '600', color: '#fff', marginBottom: '0.75rem' }}>{t.cardSimilarMovies}</h3>
        {isFetchingDetails ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}><span className="small-loader"></span></div>
        ) : mediaDetails.similar?.length > 0 ? (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {mediaDetails.similar.map(media => (
              <button key={media.id} onClick={() => handleSimilarMediaClick(media)} style={{ flexShrink: 0, width: '8rem', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                <img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : 'https://placehold.co/128x192/1f2937/9ca3af?text=?'} alt="" style={{ width: '100%', borderRadius: '0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{media.title}</p>
              </button>
            ))}
          </div>
        ) : <p style={{ color: '#9ca3af' }}>{t.noMoviesFound}</p>}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
        <button onClick={handleGoBack} disabled={mediaHistory.length === 0} style={{ padding: '0.5rem 1.5rem', backgroundColor: 'rgba(75,85,99,0.8)', color: 'white', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: mediaHistory.length === 0 ? 'not-allowed' : 'pointer', opacity: mediaHistory.length === 0 ? 0.5 : 1 }}>← Back</button>
        <button onClick={handleSurpriseMe} disabled={isDiscovering} style={{ padding: '0.5rem 1.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', color: 'white', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>Next →</button>
      </div>
    </div>
  </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            {hasSearched && allMedia.length === 0 ? (
              <div>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '1rem' }}>{t.noMoviesFound}</p>
                <button onClick={resetAndClearFilters} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#a855f7', color: 'white', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>{t.clearAllFilters}</button>
              </div>
            ) : !hasSearched && (
              <p style={{ fontSize: '1.25rem', color: '#9ca3af' }}>{t.welcomeMessage}</p>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <TrailerModal isOpen={isTrailerModalOpen} close={closeModal} trailerKey={modalTrailerKey} />
      <FilterModal isOpen={isFilterModalOpen} close={() => setIsFilterModalOpen(false)} handleClearFilters={resetAndClearFilters} filters={filters} handleGenreChangeInModal={handleGenreChangeInModal} handlePlatformChange={handlePlatformChange} genresMap={genresMap} allPlatformOptions={allPlatformOptions} platformSearchQuery={platformSearchQuery} setPlatformSearchQuery={setPlatformSearchQuery} t={t} />
      <WatchedMediaModal isOpen={isWatchedModalOpen} close={() => setIsWatchedModalOpen(false)} watchedMedia={watchedMedia} handleUnwatchMedia={handleUnwatchMedia} mediaType={mediaType} t={t} cookieConsent={cookieConsent} />
      <WatchlistModal isOpen={isWatchlistModalOpen} close={() => setIsWatchlistModalOpen(false)} watchlist={watchList} handleToggleWatchlist={handleToggleWatchlist} mediaType={mediaType} t={t} cookieConsent={cookieConsent} />
      <ActorDetailsModal isOpen={isActorModalOpen} close={closeModal} actorDetails={actorDetails} isFetching={isFetchingActorDetails} t={t} />
      <SimilarMediaModal media={modalMedia} close={closeModal} fetchFullMediaDetails={fetchFullMediaDetails} handleActorClick={handleActorClick} handleSimilarMediaClick={handleSimilarMediaClick} t={t} userRegion={userRegion} openTrailerModal={openTrailerModal} />
      <CookieConsentModal isOpen={!cookieConsent} onAccept={() => setCookieConsent(true)} t={t} />

      {/* Region Selector Modal */}
      {(showRegionSelector || !userRegion) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.5rem' }}>{t.selectRegionPrompt}</h1>
            {availableRegions.length > 0 ? (
              <select onChange={(e) => handleRegionChange(e.target.value)} defaultValue="" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '0.5rem', color: '#fff', fontSize: '1rem' }}>
                <option value="" disabled>-- {t.region} --</option>
                {availableRegions.map(region => (
                  <option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>
                ))}
              </select>
            ) : (
              <span className="loader"></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with Toast Provider
const AppWithProviders = () => {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
};