import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from './api.js';
import { useLocalStorage } from './hooks.js';

// --- CONFIGURACIÓN DE COLORES Y TRADUCCIONES (Como en la referencia) ---
const ACCENT_COLORS = [
    { name: 'Indigo', from: '#6366f1', to: '#8b5cf6', text: 'text-indigo-400' },
    { name: 'Rose', from: '#f43f5e', to: '#e11d48', text: 'text-rose-400' },
    { name: 'Emerald', from: '#10b981', to: '#059669', text: 'text-emerald-400' }
];

const translations = {
    en: { title: "Don't know what to watch?", subtitle: "Roll the dice to find your next favorite film or show.", movies: "Movies", tvShows: "TV Shows", surpriseMe: "Surprise Me", searching: "Searching...", showFilters: "Advanced Filters", clearFilters: "Clear", any: "Any", decade: "Decade", allDecades: "All Decades", minRating: "Min. Rating", duration: "Max. Duration", ageRating: "Age Rating", includeGenre: "Include Genres", excludeGenre: "Exclude Genres", platform: "Streaming Platforms", castNotFound: "Cast not found.", director: "Director", cast: "Cast", genres: "Genres", trailer: "Watch Trailer", watchlist: "Add to Watchlist" },
    es: { title: "¿No sabes qué ver?", subtitle: "Tira el dado para encontrar tu próxima película o serie favorita.", movies: "Películas", tvShows: "Series", surpriseMe: "¡Sorpréndeme!", searching: "Buscando...", showFilters: "Filtros Avanzados", clearFilters: "Limpiar", any: "Cualquiera", decade: "Década", allDecades: "Todas", minRating: "Nota Mínima", duration: "Duración Máx.", ageRating: "Edad", includeGenre: "Incluir Géneros", excludeGenre: "Excluir Géneros", platform: "Plataformas", castNotFound: "Reparto no encontrado.", director: "Director", cast: "Reparto", genres: "Géneros", trailer: "Ver Tráiler", watchlist: "Añadir a lista" }
};

export default function App() {
    // --- ESTADO Y PERSISTENCIA (v0.0.7) ---
    const [mediaType, setMediaType] = useLocalStorage('mp_type', 'movie');
    const [accent, setAccent] = useLocalStorageState('mp_accent_v3', ACCENT_COLORS[0]);
    const [language, setLanguage] = useLocalStorageState('mp_lang', 'en');
    const [userRegion] = useLocalStorageState('mp_region', 'US');
    
    // Estado de Filtros Avanzados (RESTABLECIDO)
    const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0, actor: null, duration: 0, ageRating: 0 };
    const [filters, setFilters] = useLocalStorageState('mp_filters_v5', initialFilters);

    const [genres, setGenres] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [platformSearch, setPlatformSearch] = useState('');

    const t = translations[language];
    const cardRef = useRef(null);

    // Opciones de filtros (Memorizadas para rendimiento)
    const durationOptions = useMemo(() => [ { label: t.any, lte: 999 }, { label: "< 90 min", lte: 90 }, { label: "90-120 min", lte: 120 }, { label: "> 120 min", lte: 999 } ], [t]);
    const ageRatingOptions = useMemo(() => { const ratings = userRegion === 'US' ? ['G', 'PG', 'PG-13', 'R'] : ['U', 'PG', '12', '15', '18']; return [t.any, ...ratings]; }, [userRegion, t]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        api.getGenres(mediaType, language).then(d => setGenres(d.genres || []));
        api.getPlatforms(mediaType, userRegion).then(d => {
            const top = [8, 337, 119, 350, 15, 2, 1899];
            setPlatforms(d.results?.filter(p => top.includes(p.provider_id)) || []);
        });
    }, [mediaType, language, userRegion]);

    // --- LÓGICA DE DADO (CON TODOS LOS FEATURES) ---
    const rollDice = async () => {
        setLoading(true);
        setResult(null);
        try {
            const selectedDuration = durationOptions[filters.duration];
            const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
            
            const params = {
                language,
                watch_region: userRegion,
                with_watch_monetization_types: 'flatrate', // STREAMING ONLY
                sort_by: 'popularity.desc',
                'vote_count.gte': mediaType === 'movie' ? 200 : 100,
                page: Math.floor(Math.random() * 5) + 1,
                
                // Aplicación de filtros avanzados
                with_genres: filters.genre.join(','),
                without_genres: filters.excludeGenres.join(','),
                with_watch_providers: filters.platform.join('|'),
                'vote_average.gte': filters.minRating > 0 ? filters.minRating : undefined,
                ...(filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${filters.decade}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` }),
                ...(filters.duration > 0 && { 'with_runtime.lte': selectedDuration.lte, 'with_runtime.gte': selectedDuration.gte }),
                ...(filters.ageRating > 0 && { certification_country: userRegion, certification: ageRatingOptions[filters.ageRating] }),
                ...(filters.actor && { with_cast: filters.actor.id })
            };

            const data = await api.discoverMedia(mediaType, params);
            if (data.results?.length > 0) {
                const pick = data.results[Math.floor(Math.random() * data.results.length)];
                const details = await api.getFullDetails(mediaType, pick.id, language);
                
                // Extraer certificación (Lógica de app.js original)
                const cert = mediaType === 'movie' 
                    ? details.release_dates?.results?.find(r => r.iso_3166_1 === userRegion)?.release_dates[0]?.certification
                    : details.content_ratings?.results?.find(r => r.iso_3166_1 === userRegion)?.rating;
                
                setResult({ ...details, cert: cert || 'NR' });
                setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }));
    const resetFilters = () => setFilters(initialFilters);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* NAV SUPERIOR (Diseño moviepicker-rose) */}
            <nav className="border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-end gap-6">
                    {/* Selectores de Idioma y Acento (Como en la referencia) */}
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-full border border-slate-800">
                        {['en', 'es'].map(lang => (
                            <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 rounded-full text-xs font-bold ${language === lang ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{lang.toUpperCase()}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {ACCENT_COLORS.map(c => (
                            <button key={c.name} onClick={() => setAccent(c)} className={`w-5 h-5 rounded-full transition-transform ${accent.name === c.name ? 'scale-125 ring-2 ring-white' : 'opacity-50'}`} style={{backgroundColor: c.from}} />
                        ))}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-16 text-center">
                {/* HERO SECTION (Diseño moviepicker-rose) */}
                <div className="mb-20">
                    <div className="inline-flex p-1 rounded-full bg-slate-900 border border-slate-800 mb-10">
                        <button onClick={() => setMediaType('movie')} className={`px-6 py-2 rounded-full text-xs font-black tracking-widest ${mediaType === 'movie' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>{t.movies.toUpperCase()}</button>
                        <button onClick={() => setMediaType('tv')} className={`px-6 py-2 rounded-full text-xs font-black tracking-widest ${mediaType === 'tv' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>{t.tvShows.toUpperCase()}</button>
                    </div>
                    
                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tightest leading-none mb-6">
                        {t.title.split('?')[0]}<span style={{color: accent.from}}>?</span>
                    </h2>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12 font-medium">{t.subtitle}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={rollDice} disabled={loading} className="px-12 py-5 bg-white text-black rounded-3xl font-black text-2xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-2xl flex items-center gap-3">
                            {loading ? <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin" /> : '🎲'} {loading ? t.searching : t.surpriseMe}
                        </button>
                        <button onClick={() => setShowFiltersModal(true)} className="px-8 py-5 bg-slate-900 text-white rounded-3xl font-bold border border-slate-800 hover:border-slate-600 transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            {t.showFilters}
                        </button>
                    </div>
                </div>

                {/* RESULT CARD (Diseño moviepicker-rose) */}
                {result && (
                    <div ref={cardRef} className="grid md:grid-cols-12 gap-12 items-center text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 bg-slate-950/50 p-8 rounded-[3rem] border border-slate-800/50">
                        <div className="md:col-span-5 relative group">
                            <div className={`absolute -inset-4 bg-gradient-to-r ${accent.gradient} rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <img src={`https://image.tmdb.org/t/p/w780${result.poster_path}`} className="relative rounded-[3rem] shadow-2xl border border-white/5 w-full aspect-[2/3] object-cover" alt="poster" />
                        </div>
                        <div className="md:col-span-7">
                            <div className="flex items-center gap-3 mb-6 text-sm font-black tracking-widest text-slate-500 uppercase">
                                <span className="text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl">★ {result.vote_average.toFixed(1)}</span>
                                <span className={`border border-slate-800 ${accent.text} px-3 py-1.5 rounded-xl`}>{result.cert}</span>
                                <span>{result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}</span>
                                <span>•</span>
                                <span>{result.runtime || result.episode_run_time?.[0] || '?'} MIN</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase break-words">
                                {result.title || result.name}
                            </h3>
                            <p className="text-slate-400 text-xl leading-relaxed mb-12 font-medium line-clamp-6">{result.overview}</p>
                            <div className="flex flex-wrap gap-4">
                                <button className={`px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 uppercase tracking-wide`}>
                                    {t.trailer}
                                </button>
                                <button className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-black text-lg hover:bg-slate-800 transition-all uppercase tracking-wide">
                                    + {t.watchlist}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL DE FILTROS AVANZADOS (Todos los features restaurados) */}
            {showFiltersModal && (
                <div className="fixed inset-0 z-[100] flex justify-end" animate-in fade-in duration-300>
                    <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={() => setShowFiltersModal(false)} />
                    <aside className="relative w-full max-w-md bg-[#0b1224] border-l border-slate-800 p-8 overflow-y-auto animate-in slide-in-from-right duration-500 space-y-10 scrollbar-thin">
                        <div className="flex justify-between items-center">
                            <h4 className="text-2xl font-black">{t.showFilters}</h4>
                            <button onClick={resetFilters} className="text-xs font-bold text-rose-400 hover:text-rose-300">{t.clearFilters}</button>
                        </div>

                        {/* RANGOS (Nota, Década, Duración, Edad) */}
                        <div className="space-y-6">
                            {[ { id: 'minRating', label: t.minRating, min: 0, max: 9, step: 1, display: (v) => v > 0 ? `★ ${v.toFixed(1)}` : t.any },
                               { id: 'decade', label: t.decade, options: [2020, 2010, 2000, 1990, 1980, 1970], display: (v) => v !== 'todos' ? `${v}s` : t.allDecades },
                               { id: 'duration', label: t.duration, min: 0, max: durationOptions.length - 1, step: 1, display: (v) => durationOptions[v].label },
                               { id: 'ageRating', label: t.ageRating, min: 0, max: ageRatingOptions.length - 1, step: 1, display: (v) => ageRatingOptions[v] }
                            ].map(filter => (
                                <div key={filter.id}>
                                    <label className="filter-label"><span className="text-sm font-medium text-slate-400">{filter.label}</span><span className={`${accent.text} font-bold`}>{filter.display(filters[filter.id])}</span></label>
                                    {filter.options ? (
                                        <select value={filters.decade} onChange={(e) => handleFilterChange('decade', e.target.value)} className="filter-input"><option value="todos">{t.allDecades}</option>{filter.options.map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select>
                                    ) : (
                                        <input type="range" min={filter.min} max={filter.max} step={filter.step} value={filters[filter.id]} onChange={(e) => handleFilterChange(filter.id, parseFloat(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[${accent.from}] bg-slate-800`}/>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* PLATAFORMAS (Iconos circulares) */}
                        <div>
                            <p className="filter-section-title">{t.platform}</p>
                            <input type="text" value={platformSearch} onChange={(e) => setPlatformSearch(e.target.value)} placeholder="Search..." className="filter-input mb-4"/>
                            <div className="grid grid-cols-5 gap-3 max-h-40 overflow-y-auto scrollbar-thin">
                                {platforms.filter(p => p.provider_name.toLowerCase().includes(platformSearch.toLowerCase())).map(p => (
                                    <button key={p.provider_id} onClick={() => { const current = [...filters.platform]; const idx = current.indexOf(p.provider_id); if (idx > -1) current.splice(idx, 1); else current.push(p.provider_id); handleFilterChange('platform', current); }} className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${filters.platform.includes(p.provider_id) ? `border-[${accent.from}] scale-105 shadow-lg` : 'border-transparent grayscale opacity-50'}`}><img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name}/></button>
                                ))}
                            </div>
                        </div>

                        {/* GÉNEROS (Chips de Incluir/Excluir) */}
                        {[ { id: 'genre', label: t.includeGenre, color: accent.from }, { id: 'excludeGenres', label: t.excludeGenre, color: '#f43f5e' } ].map(section => (
                            <div key={section.id}>
                                <p className="filter-section-title" style={{color: section.color}}>{section.label}</p>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                                    {genres.map(g => (
                                        <button key={g.id} onClick={() => { const current = [...filters[section.id]]; const idx = current.indexOf(g.id); if (idx > -1) current.splice(idx, 1); else current.push(g.id); handleFilterChange(section.id, current); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filters[section.id].includes(g.id) ? `text-white border-transparent` : 'bg-slate-900 border-slate-800 text-slate-400'}`} style={{ backgroundColor: filters[section.id].includes(g.id) ? section.color : undefined }}>{g.name}</button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button onClick={() => setShowFiltersModal(false)} className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-wider text-sm mt-10 hover:bg-slate-200">{t.showFilters}</button>
                    </aside>
                </div>
            )}
        </div>
    );
}

// Estilos de ayuda (Tailwind Custom Class Strings)
const quickBtnStyle = "bg-slate-900 border border-slate-800 text-slate-500 px-4 py-2 rounded-xl text-xs font-black tracking-widest";