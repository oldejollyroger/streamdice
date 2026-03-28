// app.js (v1.3.1 - Debug Version)

const App = () => {
  const { useState, useEffect, useCallback, useMemo, useRef } = React;

  // Get toast function safely
  let addToast;
  try {
    const toastContext = useToast();
    addToast = toastContext.addToast;
  } catch (e) {
    addToast = (msg) => console.log('Toast:', msg);
  }

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
  const [watchedMedia, setWatchedMedia] = useLocalStorageState(WATCHED_KEY, {});
  const [watchList, setWatchList] = useLocalStorageState(WATCHLIST_KEY, {});

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

  const t = translations[language];
  const cardRef = useRef(null);
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
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-PT', name: 'Português' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어/조선말' },
    { code: 'zh-CN', name: '中文' }
  ];

  const showInstallButton = installPrompt && !isIos && !isStandalone;
  const showIosInstallInstructions = isIos && !isStandalone;
  const isCurrentMediaWatched = selectedMedia && watchedMedia[selectedMedia.id];

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
  };

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
    if (userRegion) localStorage.setItem('movieRandomizerRegion', JSON.stringify(userRegion));
  }, [userRegion]);

  useEffect(() => {
    localStorage.setItem('mediaPickerFilters_v4', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(i);
    if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true);
    const p = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', p);
    return () => window.removeEventListener('beforeinstallprompt', p);
  }, []);

  // ============================================
  // MODAL HANDLERS
  // ============================================
  const openTrailerModal = (key) => {
    setModalTrailerKey(key);
    setIsTrailerModalOpen(true);
  };

  const closeModal = () => {
    setIsTrailerModalOpen(false);
    setModalTrailerKey(null);
    setIsActorModalOpen(false);
    setModalMedia(null);
    setIsWatchedModalOpen(false);
    setIsWatchlistModalOpen(false);
    setIsFilterModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================
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

  useEffect(() => {
    const fetchLanguageData = async () => {
      if (!tmdbLanguage) return;
      try {
        const d = await fetchApi(`genre/${mediaType}/list`, { language: tmdbLanguage });
        setGenresMap(d.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {}));
      } catch (e) {
        console.error("Error fetching language data:", e);
      }
    };
    fetchLanguageData();
  }, [language, tmdbLanguage, mediaType, fetchApi]);

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
  }, [debouncedSearchQuery, tmdbLanguage, mediaType, genresMap, fetchApi]);

  // Fetch full media details
  const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
    if (!mediaId || !type) return null;
    try {
      const endpoint = `${type}/${mediaId}`;
      const append_to_response = type === 'movie'
        ? 'credits,videos,watch/providers,similar,recommendations,release_dates'
        : 'credits,videos,watch/providers,similar,recommendations,content_ratings';
      const data = await fetchApi(endpoint, { language: tmdbLanguage, append_to_response });

      let certification = '';
      if (type === 'movie') {
        const releaseDates = data.release_dates?.results || [];
        const usRelease = releaseDates.find(r => r.iso_3166_1 === userRegion);
        certification = usRelease?.release_dates.find(rd => rd.certification)?.certification || '';
      } else {
        const contentRatings = data.content_ratings?.results || [];
        const usRating = contentRatings.find(r => r.iso_3166_1 === userRegion);
        certification = usRating?.rating || '';
      }

      const director = data.credits?.crew?.find(p => p.job === 'Director');
      const similarMedia = [...(data.recommendations?.results || []), ...(data.similar?.results || [])]
        .filter((v, i, a) => v.poster_path && a.findIndex(t => (t.id === v.id)) === i)
        .map(r => normalizeMediaData(r, type, genresMap))
        .filter(Boolean)
        .slice(0, 10);

      const regionData = data['watch/providers']?.results?.[userRegion];
      const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`;
      const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
      const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
      const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
      const combinedPayProviders = [...rentProviders, ...buyProviders];
      const uniquePayProviderIds = new Set();
      const uniquePayProviders = combinedPayProviders.filter(p => {
        if (uniquePayProviderIds.has(p.provider_id)) return false;
        uniquePayProviderIds.add(p.provider_id);
        return true;
      });

      return {
        ...data,
        duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
        providers,
        rentalProviders: uniquePayProviders,
        cast: data.credits?.cast?.slice(0, 10) || [],
        director,
        seasons: data.number_of_seasons,
        trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null,
        similar: similarMedia,
        certification
      };
    } catch (err) {
      console.error(`Error fetching details for ${type} ${mediaId}`, err);
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

  // Local storage sync
  useEffect(() => {
    if (cookieConsent) {
      const wm = localStorage.getItem(WATCHED_KEY);
      const wl = localStorage.getItem(WATCHLIST_KEY);
      if (wm) { try { setWatchedMedia(JSON.parse(wm)); } catch (e) { } }
      if (wl) { try { setWatchList(JSON.parse(wl)); } catch (e) { } }
    }
  }, [cookieConsent]);

  useEffect(() => {
    if (cookieConsent) localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMedia));
  }, [watchedMedia, cookieConsent]);

  useEffect(() => {
    if (cookieConsent) localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchList));
  }, [watchList, cookieConsent]);

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
        const allowedRatings = ageRatingOptions.slice(1, filters.ageRating + 1).join('|');
        ageRatingParams.certification_country = userRegion;
        ageRatingParams.certification = allowedRatings;
      }

      const queryParams = {
        language: tmdbLanguage,
        'vote_count.gte': mediaType === 'movie' ? 200 : 100,
        watch_region: userRegion,
        ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') },
        ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') },
        ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') },
        ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating },
        ...filters.decade !== 'todos' && {
          [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`,
          [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31`
        },
        ...(filters.actor && { with_cast: filters.actor.id }),
        ...(filters.creator && { with_crew: filters.creator.id }),
        ...(filters.duration > 0 && {
          [`${runtimeParam}.gte`]: selectedDuration.gte,
          [`${runtimeParam}.lte`]: selectedDuration.lte
        }),
        ...ageRatingParams,
        sort_by: 'popularity.desc'
      };

      const initialData = await fetchApi(`discover/${mediaType}`, queryParams);
      const totalPages = Math.min(initialData.total_pages, 200);

      if (totalPages === 0) {
        setAllMedia([]);
        setSelectedMedia(null);
        setIsDiscovering(false);
        addToast(t.noMoviesFound || 'No movies found', 'info');
        return;
      }

      const randomPage = Math.floor(Math.pow(Math.random(), 2) * (totalPages - 1)) + 1;
      const data = randomPage === 1 ? initialData : await fetchApi(`discover/${mediaType}`, { ...queryParams, page: randomPage });
      const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
      const unwatchedMedia = transformedMedia.filter(m => !watchedMedia[m.id]);

      setAllMedia(unwatchedMedia);

      if (unwatchedMedia.length > 0) {
        const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)];
        setSelectedMedia(newMedia);
      } else {
        setSelectedMedia(null);
        addToast(t.noMoviesFound || 'No movies found', 'info');
      }

    } catch (err) {
      console.error("Error discovering media:", err);
      setError(err.message);
    } finally {
      setIsDiscovering(false);
    }
  }, [filters, tmdbLanguage, mediaType, userRegion, genresMap, watchedMedia, selectedMedia, fetchApi, durationOptions, ageRatingOptions, addToast, t]);

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
      addToast('Removed from watched', 'info');
    } else {
      newWatched[media.id] = {
        id: media.id,
        title: media.title,
        poster: media.poster,
        mediaType: media.mediaType,
        year: media.year
      };
      addToast('Marked as watched! ✓', 'watched');
      
      const newCount = Object.keys(newWatched).length;
      if (newCount > 0 && newCount % 10 === 0) {
        setShowConfetti(true);
      }
    }
    setWatchedMedia(newWatched);
  };

  const handleUnwatchMedia = (mediaId) => {
    const newWatched = { ...watchedMedia };
    delete newWatched[mediaId];
    setWatchedMedia(newWatched);
    addToast('Removed from watched', 'info');
  };

  const handleToggleWatchlist = (media) => {
    const newWatchlist = { ...watchList };
    if (newWatchlist[media.id]) {
      delete newWatchlist[media.id];
      addToast('Removed from watchlist', 'info');
    } else {
      newWatchlist[media.id] = {
        id: media.id,
        title: media.title,
        poster: media.poster,
        mediaType: media.mediaType,
        year: media.year
      };
      addToast('Added to watchlist! ♡', 'watchlist');
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
      navigator.share({ title: selectedMedia.title, url }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        addToast('Link copied!', 'success');
      });
    }
  }, [selectedMedia, addToast]);

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
    setModalMedia(normalizeMediaData(media, mediaType, genresMap));
  };

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
      if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
      setSelectedMedia(result);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loader"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <p className="text-red-500 text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Confetti */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] bg-clip-text text-transparent">
            StreamDice
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Media Type Switcher */}
          <div className="flex media-type-switcher rounded-full p-1">
            <button
              onClick={() => handleMediaTypeChange('movie')}
              className={`px-4 py-2 rounded-full text-sm media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}
            >
              {t.movies}
            </button>
            <button
              onClick={() => handleMediaTypeChange('tv')}
              className={`px-4 py-2 rounded-full text-sm media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}
            >
              {t.tvShows}
            </button>
          </div>

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-40 md:w-56 p-2 pl-9 bg-white/10 border border-[var(--color-card-border)] rounded-full text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {isSearching && <span className="small-loader absolute right-3 top-1/2 -translate-y-1/2"></span>}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full md:w-72 right-0 bg-[var(--color-bg)] border border-[var(--color-card-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="search-results-close">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {searchResults.map(result => (
                  <button
                    key={`${result.resultType}-${result.id}`}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                  >
                    <img
                      src={result.poster ? `${TMDB_THUMBNAIL_BASE_URL}${result.poster}` : 'https://placehold.co/40x60/1f2937/9ca3af?text=?'}
                      alt=""
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-[var(--color-text-primary)] truncate">{result.title}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{result.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <SettingsDropdown
            mode={mode} setMode={setMode}
            accent={accent} setAccent={setAccent}
            language={language} setLanguage={setLanguage}
            tmdbLanguage={tmdbLanguage} setTmdbLanguage={setTmdbLanguage}
            tmdbLanguages={tmdbLanguages}
            t={t}
            openWatchedModal={() => setIsWatchedModalOpen(true)}
            openWatchlistModal={() => setIsWatchlistModalOpen(true)}
            openRegionSelector={() => setShowRegionSelector(true)}
          />
        </div>
      </header>

      {/* Install PWA */}
      {showInstallButton && <InstallPwaButton t={t} handleInstallClick={handleInstallClick} />}
      {showIosInstallInstructions && <InstallPwaInstructions t={t} />}

      {/* Quick Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {quickFilterGenres.map(genre => (
          <button
            key={genre.id}
            onClick={() => handleQuickFilterToggle('genre', genre.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.genre.includes(genre.id) ? 'quick-filter-btn-active' : ''}`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Platform Filters */}
      {userRegion && quickPlatformOptions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {quickPlatformOptions.map(p => (
            <button
              key={p.id}
              onClick={() => handleQuickFilterToggle('platform', p.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.platform.includes(p.id) ? 'quick-filter-btn-active' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6 items-end">
        <div>
          <label className="filter-label text-xs text-[var(--color-text-secondary)]">{t.decade}</label>
          <select
            value={filters.decade}
            onChange={(e) => handleFilterChange('decade', e.target.value)}
            className="w-full p-2 bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
          >
            <option value="todos">{t.allDecades}</option>
            {[2020, 2010, 2000, 1990, 1980, 1970].map(d => (
              <option key={d} value={d}>{`${d}s`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="filter-label text-xs text-[var(--color-text-secondary)]">{t.minRating} {Number(filters.minRating).toFixed(1)}</label>
          <input type="range" min="0" max="9" step="0.5" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
        </div>

        <div>
          <label className="filter-label text-xs text-[var(--color-text-secondary)]">{t.duration}<span className="text-[var(--color-accent-text)]">{durationOptions[filters.duration].label}</span></label>
          <input type="range" min="0" max="3" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
        </div>

        <div>
          <label className="filter-label text-xs text-[var(--color-text-secondary)]">{t.ageRating}<span className="text-[var(--color-accent-text)]">{ageRatingOptions[filters.ageRating]}</span></label>
          <input type="range" min="0" max={ageRatingOptions.length - 1} value={filters.ageRating} onChange={(e) => handleFilterChange('ageRating', e.target.value)} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
        </div>

        <button onClick={() => setIsFilterModalOpen(true)} className="w-full sm:col-span-2 md:col-span-2 lg:col-span-1 p-2 bg-white/10 dark:bg-black/20 hover:border-slate-300 dark:hover:border-slate-700 border border-slate-200 dark:border-slate-800 text-[var(--color-text-primary)] font-semibold rounded-full transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          {t.showFilters}
        </button>
      </div>

      {/* Surprise Me Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSurpriseMe}
          disabled={isDiscovering || !userRegion}
          className="surprise-btn px-8 py-3 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center gap-2"
        >
          {isDiscovering ? (
            <>
              <span className="small-loader" style={{ marginLeft: 0, marginRight: '0.5rem', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}></span>
              {t.searching}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
                <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
              </svg>
              {t.surpriseMe}
            </>
          )}
        </button>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {filters.actor && (
          <span className="filter-pill">
            {filters.actor.title}
            <button onClick={() => { setFilters(f => ({ ...f, actor: null })); resetAllState(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        )}
        {filters.creator && (
          <span className="filter-pill">
            {filters.creator.title}
            <button onClick={() => { setFilters(f => ({ ...f, creator: null })); resetAllState(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        )}
        {filters.platform.map(id => {
          const platform = allPlatformOptions.find(p => p.id === id);
          return platform && (
            <span key={id} className="filter-pill">
              {platform.name}
              <button onClick={() => handleQuickFilterToggle('platform', id)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          );
        })}
        {filters.genre.map(id => genresMap[id] && (
          <span key={id} className="filter-pill">
            {genresMap[id]}
            <button onClick={() => handleQuickFilterToggle('genre', id)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center">
        {isDiscovering ? (
          <DiceRollAnimation isRolling={true} />
        ) : selectedMedia ? (
          <div className="w-full max-w-4xl container-style p-6 movie-card-enter">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Poster */}
              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <img
                  src={selectedMedia.poster ? `${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}` : 'https://placehold.co/300x450/1f2937/9ca3af?text=No+Poster'}
                  alt={`Poster for ${selectedMedia.title}`}
                  className="w-48 md:w-56 rounded-lg shadow-xl"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x450/1f2937/9ca3af?text=No+Poster'; }}
                />
                {!isFetchingDetails && mediaDetails.trailerKey && (
                  <button onClick={() => openTrailerModal(mediaDetails.trailerKey)} className="w-full max-w-[220px] flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)]/20 text-[var(--color-accent-text)] font-bold rounded-lg shadow-md transition-all hover:bg-[var(--color-accent)]/30 hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
                    {t.cardTrailer}
                  </button>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">{selectedMedia.title}</h2>
                <p className="text-[var(--color-text-secondary)] line-clamp-4">{selectedMedia.synopsis}</p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleMarkAsWatched(selectedMedia)} className={`flex-1 min-w-[140px] py-3 px-4 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${isCurrentMediaWatched ? 'bg-green-600/80 hover:bg-green-600' : 'bg-red-600/80 hover:bg-red-600'}`}>
                    {isCurrentMediaWatched ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                        {t.cardIsWatched}
                      </>
                    ) : t.cardMarkAsWatched}
                  </button>

                  <button onClick={() => handleToggleWatchlist(selectedMedia)} className="flex-1 min-w-[140px] py-3 px-4 bg-sky-600/80 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                    {watchList[selectedMedia.id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                    )}
                    {t.saveForLater}
                  </button>

                  <button onClick={handleShare} className="py-3 px-4 bg-slate-600/80 hover:bg-slate-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    {t.shareButton}
                  </button>
                </div>

                {/* Details Section */}
                <div className="pt-4 border-t border-[var(--color-card-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">{t.details}</h3>
                  <MediaCardContent media={selectedMedia} details={mediaDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} handleActorClick={handleActorClick} />
                </div>

                {/* Similar */}
                <div className="pt-4 border-t border-[var(--color-card-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">{t.cardSimilarMovies}</h3>
                  {isFetchingDetails ? (
                    <div className="flex justify-center"><span className="small-loader"></span></div>
                  ) : mediaDetails.similar?.length > 0 ? (
                    <div className="horizontal-scroll-container">
                      {mediaDetails.similar.map(media => (
                        <button key={media.id} onClick={() => handleSimilarMediaClick(media)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150">
                          <img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : 'https://placehold.co/128x192/1f2937/9ca3af?text=?'} alt={media.title} className="w-full rounded-lg shadow-md" onError={(e) => { e.target.src = 'https://placehold.co/128x192/1f2937/9ca3af?text=?'; }} />
                          <p className="text-xs mt-1 text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-accent-text)]">{media.title}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-secondary)]">{t.noMoviesFound}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-[var(--color-card-border)]">
              <button onClick={handleGoBack} disabled={mediaHistory.length === 0} className="px-6 py-2 bg-slate-600/80 hover:bg-slate-600 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back
              </button>
              <button onClick={handleSurpriseMe} disabled={isDiscovering} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-full disabled:opacity-50 flex items-center gap-2">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            {hasSearched && allMedia.length === 0 && !isDiscovering ? (
              <div className="space-y-4">
                <p className="text-xl text-[var(--color-text-secondary)]">{t.noMoviesFound}</p>
                <button onClick={resetAndClearFilters} className="px-6 py-2 bg-[var(--color-accent)] text-white font-bold rounded-full hover:opacity-90">
                  {t.clearAllFilters}
                </button>
              </div>
            ) : !hasSearched && (
              <p className="text-xl text-[var(--color-text-secondary)]">{t.welcomeMessage}</p>
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

      {/* Region Selector */}
      {(showRegionSelector || !userRegion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md modal-content p-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t.selectRegionPrompt}</h1>
            {availableRegions.length > 0 ? (
              <select onChange={(e) => handleRegionChange(e.target.value)} defaultValue="" className="w-full p-3 bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">
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
  return React.createElement(ToastProvider, null, React.createElement(App, null));
};