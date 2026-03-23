import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from './api.js';

// --- CUSTOM HOOK PARA PERSISTENCIA ---
const useLocalStorageState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
        const stored = window.localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
};

export default function App() {
    // --- ESTADO ---
    const [mediaType, setMediaType] = useLocalStorageState('sd_type', 'movie');
    const [language, setLanguage] = useLocalStorageState('sd_lang', 'es');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filtros Avanzados (Restaurados de MoviePicker)
    const [filters, setFilters] = useLocalStorageState('sd_filters', {
        genres: [], decade: 'all', minRating: 0
    });

    const t = {
        es: { title: "¿QUÉ VEMOS HOY?", roll: "LANZAR DADO", movies: "PELÍCULAS", series: "SERIES", searching: "BUSCANDO...", rating: "NOTA", year: "AÑO" },
        en: { title: "WHAT TO WATCH?", roll: "ROLL THE DICE", movies: "MOVIES", series: "SERIES", searching: "SEARCHING...", rating: "RATING", year: "YEAR" }
    }[language];

    // --- LÓGICA ---
    const rollDice = async () => {
        setLoading(true);
        setResult(null);
        try {
            const params = {
                language: language === 'es' ? 'es-ES' : 'en-US',
                watch_region: 'ES',
                with_watch_monetization_types: 'flatrate', // SOLO STREAMING
                'vote_average.gte': filters.minRating,
                with_genres: filters.genres.join(','),
                page: Math.floor(Math.random() * 5) + 1
            };

            const data = await api.discoverMedia(mediaType, params);
            if (data.results?.length > 0) {
                const pick = data.results[Math.floor(Math.random() * data.results.length)];
                const details = await api.getFullDetails(mediaType, pick.id, language === 'es' ? 'es-ES' : 'en-US');
                setResult(details);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            {/* HEADER */}
            <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
                <div className="text-2xl font-black tracking-tighter italic uppercase">
                    STREAM<span className="text-indigo-500">DICE</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="text-xs font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                        {language.toUpperCase()}
                    </button>
                    <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                        <button onClick={() => setMediaType('movie')} className={`px-5 py-2 rounded-xl text-xs font-black ${mediaType === 'movie' ? 'bg-slate-700' : 'text-slate-500'}`}>{t.movies}</button>
                        <button onClick={() => setMediaType('tv')} className={`px-5 py-2 rounded-xl text-xs font-black ${mediaType === 'tv' ? 'bg-slate-700' : 'text-slate-500'}`}>{t.series}</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-10 text-center">
                {/* HERO */}
                <div className="mb-20">
                    <h2 className="text-6xl md:text-9xl font-black tracking-tightest leading-[0.85] mb-12">
                        {t.title}<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">STREAMDICE.</span>
                    </h2>
                    <button 
                        onClick={rollDice}
                        disabled={loading}
                        className="bg-white text-black px-14 py-8 rounded-[2.5rem] font-black text-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {loading ? t.searching : `🎲 ${t.roll}`}
                    </button>
                </div>

                {/* RESULTADO (La "Card" de MoviePicker) */}
                {result && (
                    <div className="grid md:grid-cols-12 gap-12 items-center text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 bg-slate-950/40 p-8 rounded-[3.5rem] border border-slate-800/50 shadow-2xl">
                        <div className="md:col-span-5">
                            <img src={`https://image.tmdb.org/t/p/w780${result.poster_path}`} className="rounded-[3rem] shadow-2xl border border-white/5 w-full aspect-[2/3] object-cover" alt="poster" />
                        </div>
                        <div className="md:col-span-7">
                            <div className="flex items-center gap-3 mb-6 text-sm font-black tracking-widest text-slate-500 uppercase">
                                <span className="text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl">★ {result.vote_average?.toFixed(1)}</span>
                                <span className="border border-slate-800 px-3 py-1.5 rounded-xl">{result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase">
                                {result.title || result.name}
                            </h3>
                            <p className="text-slate-400 text-xl leading-relaxed mb-12 font-medium line-clamp-6">{result.overview}</p>
                            <button className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 uppercase">
                                {language === 'es' ? 'VER TRÁILER' : 'WATCH TRAILER'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}