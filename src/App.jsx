import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from './api.js';
import { useLocalStorageState, useDebounce } from './hooks.js';

const ACCENT_COLORS = [
    { name: 'Indigo', from: '#6366f1', to: '#8b5cf6', text: 'text-indigo-400', gradient: 'from-indigo-500 to-violet-500' },
    { name: 'Rose', from: '#f43f5e', to: '#e11d48', text: 'text-rose-400', gradient: 'from-rose-500 to-red-600' }
];

export default function App() {
    // --- ESTADO ORIGINAL ---
    const [accent, setAccent] = useLocalStorageState('sd_accent', ACCENT_COLORS[0]);
    const [language, setLanguage] = useLocalStorageState('sd_lang', 'es');
    const [userRegion, setUserRegion] = useLocalStorageState('sd_region', 'ES');
    const [mediaType, setMediaType] = useLocalStorageState('sd_media_type', 'movie');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useLocalStorageState('sd_filters', { genre: [], decade: 'todos', minRating: 0 });

    const t = {
        es: { title: "STREAMDICE", subtitle: "¿No sabes qué ver? Tira el dado.", roll: "LANZAR DADO", movies: "PELÍCULAS", series: "SERIES", searching: "BUSCANDO..." },
        en: { title: "STREAMDICE", subtitle: "Don't know what to watch? Roll the dice.", roll: "ROLL THE DICE", movies: "MOVIES", series: "SERIES", searching: "SEARCHING..." }
    }[language];

    const rollDice = async () => {
        setLoading(true);
        setResult(null);
        try {
            const params = {
                language: language === 'es' ? 'es-ES' : 'en-US',
                watch_region: userRegion,
                with_watch_monetization_types: 'flatrate',
                'vote_average.gte': filters.minRating,
                with_genres: filters.genre.join(','),
                page: Math.floor(Math.random() * 5) + 1,
                sort_by: 'popularity.desc'
            };

            const data = await api.discoverMedia(mediaType, params);
            if (data.results?.length > 0) {
                const pick = data.results[Math.floor(Math.random() * data.results.length)];
                const details = await api.getFullDetails(mediaType, pick.id, params.language);
                setResult(details);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            {/* Nav con rebranding */}
            <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
                <div className="text-2xl font-black italic uppercase tracking-tighter">
                    STREAM<span style={{ color: accent.from }}>DICE</span>
                </div>
                <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                    <button onClick={() => setMediaType('movie')} className={`px-6 py-2 rounded-xl text-xs font-black ${mediaType === 'movie' ? 'bg-slate-700' : 'text-slate-500'}`}>{t.movies}</button>
                    <button onClick={() => setMediaType('tv')} className={`px-6 py-2 rounded-xl text-xs font-black ${mediaType === 'tv' ? 'bg-slate-700' : 'text-slate-500'}`}>{t.series}</button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10 text-center">
                <div className="mb-24 animate-in fade-in duration-1000">
                    <h2 className="text-7xl md:text-[9rem] font-black tracking-tightest leading-[0.8] mb-12 uppercase">
                        {t.title}<br/>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent.gradient}`}>SENSATIONS.</span>
                    </h2>
                    <button 
                        onClick={rollDice}
                        disabled={loading}
                        className="bg-white text-black px-16 py-8 rounded-[3rem] font-black text-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {loading ? t.searching : `🎲 ${t.roll}`}
                    </button>
                </div>

                {/* RESULT CARD ORIGINAL */}
                {result && (
                    <div className="grid md:grid-cols-12 gap-16 items-center text-left animate-in slide-in-from-bottom-12 duration-1000 bg-slate-950/40 p-10 rounded-[4rem] border border-slate-800/50 shadow-2xl">
                        <div className="md:col-span-5 relative group">
                            <div className={`absolute -inset-4 bg-gradient-to-r ${accent.gradient} rounded-[4rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <img src={`https://image.tmdb.org/t/p/w780${result.poster_path}`} className="relative rounded-[3.5rem] shadow-2xl border border-white/5 w-full aspect-[2/3] object-cover" alt="poster" />
                        </div>
                        <div className="md:col-span-7">
                            <div className="flex items-center gap-4 mb-8 text-sm font-black tracking-widest text-slate-500 uppercase">
                                <span className="text-amber-400 bg-amber-400/10 px-4 py-2 rounded-2xl">★ {result.vote_average?.toFixed(1)}</span>
                                <span className="border border-slate-800 px-4 py-2 rounded-2xl">{result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
                                {result.title || result.name}
                            </h3>
                            <p className="text-slate-400 text-2xl leading-relaxed mb-12 font-medium line-clamp-5">{result.overview}</p>
                            <button className={`px-12 py-6 rounded-3xl bg-indigo-600 text-white font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-widest`}>
                                {language === 'es' ? 'VER TRÁILER' : 'WATCH TRAILER'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}